import axios from "axios";
import debug from "debug";
import {
  PostType,
  BoardActivityResponse,
  CommentType,
  CommentData,
  PostData,
  ThreadType,
} from "../types/Types";
import {
  makeClientComment,
  makeClientPost,
  makeClientThread,
} from "./server-utils";

const log = debug("bobafrontend:queries-log");

export const getBoardActivityData = async (
  key: string,
  { slug, categoryFilter }: { slug: string; categoryFilter: string | null },
  cursor?: string
): Promise<BoardActivityResponse | undefined> => {
  log(`Fetching board activity for board with slug ${slug}.`);
  if (!slug) {
    log(`...can't fetch board activity for board with no slug.`);
    // TODO: don't request activity when there's no slug.
    throw new Error("Attempted to fetch board activity with no slug");
  }
  const response = await axios.get(`boards/${slug}/activity/latest`, {
    params: { cursor, categoryFilter },
  });
  log(
    `Got response for board activity with slug ${slug}. Status: ${response.status}`
  );
  if (response.status == 204) {
    // No data, let's return empty array
    return { nextPageCursor: null, activity: [] };
  }
  // Transform post to client-side type.
  return {
    nextPageCursor: response.data.next_page_cursor || null,
    activity: response.data.activity.map(makeClientThread),
  };
};

export const getThreadData = async (
  key: string,
  { threadId }: { threadId: string }
): Promise<ThreadType> => {
  if (!threadId) {
    log(`...can't fetch thread with no id.`);
    // TODO: don't request thread when there's no id.
    throw new Error("Attempted to fetch thread with no id.");
  }
  const response = await axios.get(`threads/${threadId}/`);
  log(`Fetched data for thread with id ${threadId}`);
  return makeClientThread(response.data);
};

export const dismissAllNotifications = async () => {
  await axios.post(`users/notifications/dismiss`);
  return true;
};

export const markThreadAsRead = async ({ threadId }: { threadId: string }) => {
  log(`Marking thread ${threadId} as read.`);
  await axios.get(`threads/${threadId}/visit`);
  return true;
};

export const muteThread = async ({
  threadId,
  mute,
}: {
  threadId: string;
  mute: boolean;
}) => {
  log(`Updating thread ${threadId} muted state.`);
  if (mute) {
    await axios.post(`threads/${threadId}/mute`);
  } else {
    await axios.post(`threads/${threadId}/unmute`);
  }
  return true;
};

export const hideThread = async ({
  threadId,
  hide,
}: {
  threadId: string;
  hide: boolean;
}) => {
  log(`Updating thread ${threadId} hidden state.`);
  if (hide) {
    await axios.post(`threads/${threadId}/hide`);
  } else {
    await axios.post(`threads/${threadId}/unhide`);
  }
  return true;
};

export const createThread = async (
  slug: string,
  postData: PostData
): Promise<ThreadType> => {
  const response = await axios.post(`/threads/${slug}/create`, postData);
  log(`Received thread from server:`);
  log(response.data);
  return makeClientThread(response.data);
};

export const createPost = async (
  replyToPostId: string,
  postData: PostData
): Promise<PostType> => {
  const response = await axios.post(
    `/posts/${replyToPostId}/contribute`,
    postData
  );
  const post = makeClientPost(response.data.contribution);
  log(`Received post from server:`);
  log(post);
  return post;
};

export const createComment = async ({
  replyToPostId,
  commentData,
}: {
  replyToPostId: string | null;
  commentData: CommentData;
}): Promise<CommentType> => {
  const response = await axios.post(
    `/posts/${replyToPostId}/comment`,
    commentData
  );
  const comment = makeClientComment(response.data.comment);
  log(`Received comment from server:`);
  log(comment);
  return comment;
};

export const createCommentChain = async ({
  replyToPostId,
  commentData,
}: {
  replyToPostId: string | null;
  commentData: CommentData[];
}): Promise<CommentType[]> => {
  const response = await axios.post(`/posts/${replyToPostId}/comment/chain`, {
    contentArray: commentData.map((comment) => comment.content),
    forceAnonymous: commentData.some((data) => data.forceAnonymous),
    replyToCommentId: commentData[0].replyToCommentId,
  });
  const comments = response.data.comments.map((comment: any) =>
    makeClientComment(comment)
  );
  log(`Received comment from server:`);
  log(comments);
  return comments;
};
