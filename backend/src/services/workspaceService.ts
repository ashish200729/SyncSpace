import { ActivityAction, Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { ApiError } from "../errors/apiError.js";
import { emitWorkspaceEvent } from "../realtime/socketServer.js";
import { socketEvents } from "../realtime/socketEvents.js";
import { buildInviteLink, createInviteCode, createInviteToken } from "../utils/invite.js";
import { createWorkspaceSlug } from "../utils/slug.js";
import { listWorkspaceActivity, recordActivity } from "./activityService.js";
import { ensureWorkspaceMember } from "./workspaceAccessService.js";

type CreateWorkspaceInput = {
  name: string;
  description?: string;
};

type JoinWorkspaceInput = {
  inviteCode?: string;
  inviteToken?: string;
};

const workspaceSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  inviteCode: true,
  inviteToken: true,
  inviteEnabled: true,
  inviteExpiresAt: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      members: {
        where: {
          leftAt: null,
        },
      },
      tasks: {
        where: {
          deletedAt: null,
        },
      },
    },
  },
} satisfies Prisma.WorkspaceSelect;

const workspaceMemberSelect = {
  id: true,
  workspaceId: true,
  userId: true,
  role: true,
  joinedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.WorkspaceMemberSelect;

const serializeWorkspace = (
  workspace: Prisma.WorkspaceGetPayload<{ select: typeof workspaceSelect }>,
  currentUserRole: "ADMIN" | "MEMBER",
) => ({
  id: workspace.id,
  name: workspace.name,
  slug: workspace.slug,
  description: workspace.description,
  inviteCode: currentUserRole === "ADMIN" ? workspace.inviteCode : null,
  inviteLink:
    currentUserRole === "ADMIN" ? buildInviteLink(workspace.inviteToken) : null,
  inviteEnabled: workspace.inviteEnabled,
  inviteExpiresAt: workspace.inviteExpiresAt,
  createdAt: workspace.createdAt,
  updatedAt: workspace.updatedAt,
  owner: workspace.owner,
  currentUserRole,
  permissions: {
    canCreateTasks: true,
    canManageInvites: currentUserRole === "ADMIN",
    canManageWorkspace: currentUserRole === "ADMIN",
  },
  memberCount: workspace._count.members,
  taskCount: workspace._count.tasks,
});

const serializeWorkspaceMember = (
  member: Prisma.WorkspaceMemberGetPayload<{ select: typeof workspaceMemberSelect }>,
) => ({
  id: member.id,
  workspaceId: member.workspaceId,
  role: member.role,
  joinedAt: member.joinedAt,
  user: member.user,
});

const inviteWorkspaceWhere = ({
  inviteCode,
  inviteToken,
}: JoinWorkspaceInput): Prisma.WorkspaceWhereInput => {
  const filters: Prisma.WorkspaceWhereInput[] = [];

  if (inviteCode) {
    filters.push({
      inviteCode: inviteCode.toUpperCase(),
    });
  }

  if (inviteToken) {
    filters.push({
      inviteToken,
    });
  }

  return {
    inviteEnabled: true,
    AND: [
      {
        OR: filters,
      },
      {
        OR: [
          {
            inviteExpiresAt: null,
          },
          {
            inviteExpiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
    ],
  };
};

const loadWorkspaceById = async (workspaceId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: workspaceSelect,
  });

  if (!workspace) {
    throw ApiError.notFound("Workspace not found.");
  }

  return workspace;
};

const createWorkspaceRecord = async (
  userId: string,
  { name, description }: CreateWorkspaceInput,
) => {
  return prisma.$transaction(async (transaction) => {
    const workspace = await transaction.workspace.create({
      data: {
        name,
        description,
        slug: createWorkspaceSlug(name),
        inviteCode: createInviteCode(),
        inviteToken: createInviteToken(),
        ownerId: userId,
      },
    });

    await transaction.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: "ADMIN",
      },
    });

    await recordActivity(transaction, {
      action: ActivityAction.WORKSPACE_CREATED,
      workspaceId: workspace.id,
      actorId: userId,
      metadata: {
        workspaceName: name,
      },
    });

    const fullWorkspace = await transaction.workspace.findUniqueOrThrow({
      where: {
        id: workspace.id,
      },
      select: workspaceSelect,
    });

    return fullWorkspace;
  });
};

export const createWorkspace = async (
  userId: string,
  input: CreateWorkspaceInput,
) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const workspace = await createWorkspaceRecord(userId, input);
      return serializeWorkspace(workspace, "ADMIN");
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < 2
      ) {
        continue;
      }

      throw error;
    }
  }

  throw ApiError.conflict("Unable to generate a unique workspace invite right now.");
};

export const listUserWorkspaces = async (userId: string) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: {
      userId,
      leftAt: null,
    },
    select: {
      role: true,
      workspace: {
        select: workspaceSelect,
      },
    },
  });

  return memberships
    .sort(
      (left, right) =>
        right.workspace.updatedAt.getTime() - left.workspace.updatedAt.getTime(),
    )
    .map((membership) => serializeWorkspace(membership.workspace, membership.role));
};

export const getWorkspace = async (workspaceId: string, userId: string) => {
  const workspaceAccess = await ensureWorkspaceMember(workspaceId, userId);
  const workspace = await loadWorkspaceById(workspaceId);
  return serializeWorkspace(workspace, workspaceAccess.membership.role);
};

export const getWorkspaceMembers = async (workspaceId: string, userId: string) => {
  await ensureWorkspaceMember(workspaceId, userId);

  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      leftAt: null,
    },
    orderBy: [
      {
        role: "asc",
      },
      {
        joinedAt: "asc",
      },
    ],
    select: workspaceMemberSelect,
  });

  return members.map(serializeWorkspaceMember);
};

export const joinWorkspace = async (
  userId: string,
  input: JoinWorkspaceInput,
) => {
  const workspace = await prisma.workspace.findFirst({
    where: inviteWorkspaceWhere(input),
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!workspace) {
    throw ApiError.badRequest("Invite code or link is invalid.");
  }

  const existingMembership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId,
      },
    },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      leftAt: true,
    },
  });

  if (existingMembership && existingMembership.leftAt === null) {
    return {
      workspace: await getWorkspace(workspace.id, userId),
      alreadyMember: true,
    };
  }

  try {
    const joinedWorkspace = await prisma.$transaction(
      async (transaction) => {
        const member = existingMembership
          ? await transaction.workspaceMember.update({
              where: {
                id: existingMembership.id,
              },
              data: {
                leftAt: null,
                joinedAt: new Date(),
                invitedById: workspace.ownerId,
              },
              select: workspaceMemberSelect,
            })
          : await transaction.workspaceMember.create({
              data: {
                workspaceId: workspace.id,
                userId,
                role: "MEMBER",
                invitedById: workspace.ownerId,
              },
              select: workspaceMemberSelect,
            });

        const activity = await recordActivity(transaction, {
          action: ActivityAction.WORKSPACE_MEMBER_ADDED,
          workspaceId: workspace.id,
          actorId: userId,
          metadata: {
            memberUserId: userId,
          },
        });

        const fullWorkspace = await transaction.workspace.findUniqueOrThrow({
          where: {
            id: workspace.id,
          },
          select: workspaceSelect,
        });

        return {
          member,
          workspace: fullWorkspace,
          activity,
        };
      },
      {
        maxWait: 10000,
        timeout: 10000,
      }
    );

    emitWorkspaceEvent(workspace.id, socketEvents.workspaceMemberJoined, {
      workspaceId: workspace.id,
      member: serializeWorkspaceMember(joinedWorkspace.member),
    });
    emitWorkspaceEvent(workspace.id, socketEvents.activityCreated, {
      workspaceId: workspace.id,
      activity: joinedWorkspace.activity,
    });

    return {
      workspace: serializeWorkspace(joinedWorkspace.workspace, "MEMBER"),
      alreadyMember: false,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        workspace: await getWorkspace(workspace.id, userId),
        alreadyMember: true,
      };
    }

    throw error;
  }
};

export const getWorkspaceActivity = async (
  workspaceId: string,
  userId: string,
) => {
  return listWorkspaceActivity(workspaceId, userId);
};
