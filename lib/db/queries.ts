import { eq, desc, count, and, sum, gt, max, or } from "drizzle-orm";
import { db } from "./index";
import {
  user,
  workspace,
  project,
  imageGeneration,
  videoProject,
  videoClip,
  musicTrack,
  type User,
  type Workspace,
  type Project,
  type ImageGeneration,
  type ProjectStatus,
  type VideoProject,
  type VideoClip,
  type MusicTrack,
  type VideoProjectStatus,
} from "./schema";

// ============================================================================
// User Queries
// ============================================================================

export async function getUserById(userId: string): Promise<User | null> {
  const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return result[0] || null;
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<User | null> {
  const result = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning();
  return result[0] || null;
}

// ============================================================================
// Workspace Queries
// ============================================================================

export async function getWorkspaceById(
  workspaceId: string
): Promise<Workspace | null> {
  const result = await db
    .select()
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);
  return result[0] || null;
}

export async function getWorkspaceBySlug(
  slug: string
): Promise<Workspace | null> {
  const result = await db
    .select()
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Omit<Workspace, "id" | "createdAt">>
): Promise<Workspace | null> {
  const result = await db
    .update(workspace)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workspace.id, workspaceId))
    .returning();
  return result[0] || null;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<User[]> {
  return db
    .select()
    .from(user)
    .where(eq(user.workspaceId, workspaceId))
    .orderBy(desc(user.createdAt));
}

// ============================================================================
// Image Generation Queries
// ============================================================================

export async function getImageGenerations(
  workspaceId: string,
  options?: { limit?: number; offset?: number }
): Promise<ImageGeneration[]> {
  const query = db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.workspaceId, workspaceId))
    .orderBy(desc(imageGeneration.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }

  if (options?.offset) {
    query.offset(options.offset);
  }

  return query;
}

export async function getImageGenerationById(
  id: string
): Promise<ImageGeneration | null> {
  const result = await db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getImageGenerationStats(workspaceId: string): Promise<{
  total: number;
  completed: number;
  processing: number;
  failed: number;
}> {
  const [totalResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(eq(imageGeneration.workspaceId, workspaceId));

  const [completedResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.workspaceId, workspaceId),
        eq(imageGeneration.status, "completed")
      )
    );

  const [processingResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.workspaceId, workspaceId),
        eq(imageGeneration.status, "processing")
      )
    );

  const [failedResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.workspaceId, workspaceId),
        eq(imageGeneration.status, "failed")
      )
    );

  return {
    total: totalResult?.count || 0,
    completed: completedResult?.count || 0,
    processing: processingResult?.count || 0,
    failed: failedResult?.count || 0,
  };
}

export async function createImageGeneration(
  data: Omit<ImageGeneration, "id" | "createdAt" | "updatedAt">
): Promise<ImageGeneration> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(imageGeneration)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function updateImageGeneration(
  id: string,
  data: Partial<Omit<ImageGeneration, "id" | "createdAt">>
): Promise<ImageGeneration | null> {
  const result = await db
    .update(imageGeneration)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(imageGeneration.id, id))
    .returning();
  return result[0] || null;
}

// ============================================================================
// User with Workspace (joined query)
// ============================================================================

export async function getUserWithWorkspace(userId: string): Promise<{
  user: User;
  workspace: Workspace;
} | null> {
  const userResult = await getUserById(userId);
  if (!userResult || !userResult.workspaceId) {
    return null;
  }

  const workspaceResult = await getWorkspaceById(userResult.workspaceId);
  if (!workspaceResult) {
    return null;
  }

  return {
    user: userResult,
    workspace: workspaceResult,
  };
}

// ============================================================================
// Project Queries
// ============================================================================

export async function getProjects(
  workspaceId: string,
  options?: { limit?: number; offset?: number; status?: ProjectStatus }
): Promise<Project[]> {
  let query = db
    .select()
    .from(project)
    .where(
      options?.status
        ? and(
            eq(project.workspaceId, workspaceId),
            eq(project.status, options.status)
          )
        : eq(project.workspaceId, workspaceId)
    )
    .orderBy(desc(project.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  return query;
}

export async function getProjectById(id: string): Promise<{
  project: Project;
  images: ImageGeneration[];
} | null> {
  const projectResult = await db
    .select()
    .from(project)
    .where(eq(project.id, id))
    .limit(1);

  if (!projectResult[0]) {
    return null;
  }

  const images = await db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.projectId, id))
    .orderBy(desc(imageGeneration.createdAt));

  return {
    project: projectResult[0],
    images,
  };
}

export async function getProjectStats(workspaceId: string): Promise<{
  totalProjects: number;
  completedProjects: number;
  processingProjects: number;
  totalImages: number;
  totalCost: number;
}> {
  const [totalResult] = await db
    .select({ count: count() })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  const [completedResult] = await db
    .select({ count: count() })
    .from(project)
    .where(
      and(
        eq(project.workspaceId, workspaceId),
        eq(project.status, "completed")
      )
    );

  const [processingResult] = await db
    .select({ count: count() })
    .from(project)
    .where(
      and(
        eq(project.workspaceId, workspaceId),
        eq(project.status, "processing")
      )
    );

  const [imagesResult] = await db
    .select({ total: sum(project.imageCount) })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  const [completedImagesResult] = await db
    .select({ total: sum(project.completedCount) })
    .from(project)
    .where(eq(project.workspaceId, workspaceId));

  // Calculate cost: $0.039 per completed image
  const completedImages = Number(completedImagesResult?.total) || 0;
  const totalCost = Math.round(completedImages * 0.039 * 100) / 100;

  return {
    totalProjects: totalResult?.count || 0,
    completedProjects: completedResult?.count || 0,
    processingProjects: processingResult?.count || 0,
    totalImages: Number(imagesResult?.total) || 0,
    totalCost,
  };
}

export async function createProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(project)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  const result = await db
    .update(project)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(project.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteProject(id: string): Promise<void> {
  await db.delete(project).where(eq(project.id, id));
}

export async function updateProjectCounts(projectId: string): Promise<void> {
  // Count total images for the project
  const [totalResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(eq(imageGeneration.projectId, projectId));

  // Count completed images
  const [completedResult] = await db
    .select({ count: count() })
    .from(imageGeneration)
    .where(
      and(
        eq(imageGeneration.projectId, projectId),
        eq(imageGeneration.status, "completed")
      )
    );

  const imageCount = totalResult?.count || 0;
  const completedCount = completedResult?.count || 0;

  // Determine project status based on image statuses
  let status: ProjectStatus = "pending";

  if (completedCount === imageCount && imageCount > 0) {
    status = "completed";
  } else if (completedCount > 0) {
    status = "processing";
  } else {
    // Check if any images are processing
    const [processingResult] = await db
      .select({ count: count() })
      .from(imageGeneration)
      .where(
        and(
          eq(imageGeneration.projectId, projectId),
          eq(imageGeneration.status, "processing")
        )
      );

    if ((processingResult?.count || 0) > 0) {
      status = "processing";
    }

    // Check if any images failed
    const [failedResult] = await db
      .select({ count: count() })
      .from(imageGeneration)
      .where(
        and(
          eq(imageGeneration.projectId, projectId),
          eq(imageGeneration.status, "failed")
        )
      );

    if ((failedResult?.count || 0) > 0 && completedCount === 0) {
      status = "failed";
    }
  }

  // Update project
  await db
    .update(project)
    .set({
      imageCount,
      completedCount,
      status,
      updatedAt: new Date(),
    })
    .where(eq(project.id, projectId));
}

// Get images for a project
export async function getProjectImages(
  projectId: string
): Promise<ImageGeneration[]> {
  return db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.projectId, projectId))
    .orderBy(desc(imageGeneration.createdAt));
}

// Get all versions of an image (including the original)
export async function getImageVersions(
  imageId: string
): Promise<ImageGeneration[]> {
  // First get the image to find its root
  const image = await getImageGenerationById(imageId);
  if (!image) return [];

  // The root is either the parentId or the image itself
  const rootId = image.parentId || image.id;

  // Get all versions: the root + all images with parentId = rootId
  const versions = await db
    .select()
    .from(imageGeneration)
    .where(
      // Either the root image itself OR any image with this parentId
      eq(imageGeneration.id, rootId)
    );

  const children = await db
    .select()
    .from(imageGeneration)
    .where(eq(imageGeneration.parentId, rootId));

  // Combine and sort by version
  const allVersions = [...versions, ...children].sort(
    (a, b) => (a.version || 1) - (b.version || 1)
  );

  return allVersions;
}

// Get the latest version of an image
export async function getLatestImageVersion(
  imageId: string
): Promise<ImageGeneration | null> {
  const versions = await getImageVersions(imageId);
  if (versions.length === 0) return null;
  return versions[versions.length - 1];
}

// Get the highest version number for a root image
export async function getLatestVersionNumber(
  rootImageId: string
): Promise<number> {
  // Get max version from: the root image itself OR any image with this parentId
  const [rootResult] = await db
    .select({ version: imageGeneration.version })
    .from(imageGeneration)
    .where(eq(imageGeneration.id, rootImageId))
    .limit(1);

  const [childResult] = await db
    .select({ maxVersion: max(imageGeneration.version) })
    .from(imageGeneration)
    .where(eq(imageGeneration.parentId, rootImageId));

  const rootVersion = rootResult?.version || 1;
  const childMaxVersion = childResult?.maxVersion || 0;

  return Math.max(rootVersion, childMaxVersion);
}

// Delete all versions after a specific version number
export async function deleteVersionsAfter(
  rootImageId: string,
  afterVersion: number
): Promise<number> {
  // Delete images where:
  // - parentId = rootImageId AND version > afterVersion
  // - OR id = rootImageId AND version > afterVersion (edge case for root)
  const result = await db
    .delete(imageGeneration)
    .where(
      and(
        or(
          eq(imageGeneration.parentId, rootImageId),
          eq(imageGeneration.id, rootImageId)
        ),
        gt(imageGeneration.version, afterVersion)
      )
    )
    .returning();

  return result.length;
}

// Get project images grouped by root (for version display)
export async function getProjectImagesGrouped(
  projectId: string
): Promise<Map<string, ImageGeneration[]>> {
  const images = await getProjectImages(projectId);

  // Group by root image ID
  const grouped = new Map<string, ImageGeneration[]>();

  for (const img of images) {
    const rootId = img.parentId || img.id;
    if (!grouped.has(rootId)) {
      grouped.set(rootId, []);
    }
    grouped.get(rootId)!.push(img);
  }

  // Sort each group by version
  for (const [, versions] of grouped) {
    versions.sort((a, b) => (a.version || 1) - (b.version || 1));
  }

  return grouped;
}

// Get only the latest version of each image in a project (for bulk download)
export async function getLatestVersionImages(
  projectId: string
): Promise<ImageGeneration[]> {
  const grouped = await getProjectImagesGrouped(projectId);
  const latestVersions: ImageGeneration[] = [];

  for (const [, versions] of grouped) {
    // Get the last (highest version) from each group
    const latest = versions[versions.length - 1];
    if (latest && latest.status === "completed") {
      latestVersions.push(latest);
    }
  }

  // Sort by creation date (oldest first for consistent ordering)
  return latestVersions.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

// ============================================================================
// Video Project Queries
// ============================================================================

export async function getVideoProjects(
  workspaceId: string,
  options?: { limit?: number; offset?: number; status?: VideoProjectStatus }
): Promise<VideoProject[]> {
  let query = db
    .select()
    .from(videoProject)
    .where(
      options?.status
        ? and(
            eq(videoProject.workspaceId, workspaceId),
            eq(videoProject.status, options.status)
          )
        : eq(videoProject.workspaceId, workspaceId)
    )
    .orderBy(desc(videoProject.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  return query;
}

export async function getVideoProjectById(id: string): Promise<{
  videoProject: VideoProject;
  clips: VideoClip[];
  musicTrack: MusicTrack | null;
} | null> {
  const result = await db
    .select()
    .from(videoProject)
    .where(eq(videoProject.id, id))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  const clips = await db
    .select()
    .from(videoClip)
    .where(eq(videoClip.videoProjectId, id))
    .orderBy(videoClip.sequenceOrder);

  let music: MusicTrack | null = null;
  if (result[0].musicTrackId) {
    const musicResult = await db
      .select()
      .from(musicTrack)
      .where(eq(musicTrack.id, result[0].musicTrackId))
      .limit(1);
    music = musicResult[0] || null;
  }

  return {
    videoProject: result[0],
    clips,
    musicTrack: music,
  };
}

export async function createVideoProject(
  data: Omit<VideoProject, "id" | "createdAt" | "updatedAt">
): Promise<VideoProject> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(videoProject)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function updateVideoProject(
  id: string,
  data: Partial<Omit<VideoProject, "id" | "createdAt">>
): Promise<VideoProject | null> {
  const result = await db
    .update(videoProject)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(videoProject.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteVideoProject(id: string): Promise<void> {
  await db.delete(videoProject).where(eq(videoProject.id, id));
}

export async function updateVideoProjectCounts(videoProjectId: string): Promise<void> {
  // Count total clips
  const [totalResult] = await db
    .select({ count: count() })
    .from(videoClip)
    .where(eq(videoClip.videoProjectId, videoProjectId));

  // Count completed clips
  const [completedResult] = await db
    .select({ count: count() })
    .from(videoClip)
    .where(
      and(
        eq(videoClip.videoProjectId, videoProjectId),
        eq(videoClip.status, "completed")
      )
    );

  const clipCount = totalResult?.count || 0;
  const completedClipCount = completedResult?.count || 0;

  // Update project
  await db
    .update(videoProject)
    .set({
      clipCount,
      completedClipCount,
      updatedAt: new Date(),
    })
    .where(eq(videoProject.id, videoProjectId));
}

// ============================================================================
// Video Clip Queries
// ============================================================================

export async function getVideoClipById(id: string): Promise<VideoClip | null> {
  const result = await db
    .select()
    .from(videoClip)
    .where(eq(videoClip.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getVideoClips(videoProjectId: string): Promise<VideoClip[]> {
  return db
    .select()
    .from(videoClip)
    .where(eq(videoClip.videoProjectId, videoProjectId))
    .orderBy(videoClip.sequenceOrder);
}

export async function createVideoClip(
  data: Omit<VideoClip, "id" | "createdAt" | "updatedAt">
): Promise<VideoClip> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(videoClip)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

export async function createVideoClips(
  clips: Array<Omit<VideoClip, "id" | "createdAt" | "updatedAt">>
): Promise<VideoClip[]> {
  const clipsWithIds = clips.map((clip) => ({
    ...clip,
    id: crypto.randomUUID(),
  }));
  const result = await db.insert(videoClip).values(clipsWithIds).returning();
  return result;
}

export async function updateVideoClip(
  id: string,
  data: Partial<Omit<VideoClip, "id" | "createdAt">>
): Promise<VideoClip | null> {
  const result = await db
    .update(videoClip)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(videoClip.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteVideoClip(id: string): Promise<void> {
  await db.delete(videoClip).where(eq(videoClip.id, id));
}

export async function updateClipSequenceOrders(
  clips: Array<{ id: string; sequenceOrder: number }>
): Promise<void> {
  for (const clip of clips) {
    await db
      .update(videoClip)
      .set({ sequenceOrder: clip.sequenceOrder, updatedAt: new Date() })
      .where(eq(videoClip.id, clip.id));
  }
}

// ============================================================================
// Music Track Queries
// ============================================================================

export async function getMusicTracks(
  options?: { category?: string; activeOnly?: boolean }
): Promise<MusicTrack[]> {
  let query = db.select().from(musicTrack);

  if (options?.category) {
    query = query.where(eq(musicTrack.category, options.category)) as typeof query;
  }

  if (options?.activeOnly !== false) {
    query = query.where(eq(musicTrack.isActive, true)) as typeof query;
  }

  return query.orderBy(musicTrack.name);
}

export async function getMusicTrackById(id: string): Promise<MusicTrack | null> {
  const result = await db
    .select()
    .from(musicTrack)
    .where(eq(musicTrack.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createMusicTrack(
  data: Omit<MusicTrack, "id" | "createdAt">
): Promise<MusicTrack> {
  const id = crypto.randomUUID();
  const [result] = await db
    .insert(musicTrack)
    .values({
      ...data,
      id,
    })
    .returning();
  return result;
}

// ============================================================================
// Video Stats
// ============================================================================

export async function getVideoProjectStats(workspaceId: string): Promise<{
  totalVideos: number;
  completedVideos: number;
  processingVideos: number;
  totalCostCents: number;
}> {
  const [totalResult] = await db
    .select({ count: count() })
    .from(videoProject)
    .where(eq(videoProject.workspaceId, workspaceId));

  const [completedResult] = await db
    .select({ count: count() })
    .from(videoProject)
    .where(
      and(
        eq(videoProject.workspaceId, workspaceId),
        eq(videoProject.status, "completed")
      )
    );

  const [processingResult] = await db
    .select({ count: count() })
    .from(videoProject)
    .where(
      and(
        eq(videoProject.workspaceId, workspaceId),
        or(
          eq(videoProject.status, "generating"),
          eq(videoProject.status, "compiling")
        )
      )
    );

  const [costResult] = await db
    .select({ total: sum(videoProject.actualCost) })
    .from(videoProject)
    .where(eq(videoProject.workspaceId, workspaceId));

  return {
    totalVideos: totalResult?.count || 0,
    completedVideos: completedResult?.count || 0,
    processingVideos: processingResult?.count || 0,
    totalCostCents: Number(costResult?.total) || 0,
  };
}
