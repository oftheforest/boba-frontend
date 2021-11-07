import { BoardData, BoardDescription, BoardMetadata } from "../../types/Types";
import {
  makeClientBoardData,
  makeClientBoardSummary,
  makeClientPermissions,
  makeClientRole,
} from "../client-data";

import axios from "axios";
import debug from "debug";

const error = debug("bobafrontend:queries:board-error");
const log = debug("bobafrontend:queries:board-log");
const info = debug("bobafrontend:queries:board-info");

export const muteBoard = async ({
  boardId,
  mute,
}: {
  boardId: string;
  mute: boolean;
}) => {
  log(
    `Updating board ${boardId} muted state to ${mute ? "muted" : "unmuted"}.`
  );
  if (mute) {
    await axios.post(`boards/${boardId}/mute`);
  } else {
    await axios.delete(`boards/${boardId}/mute`);
  }
  return true;
};

export const pinBoard = async ({
  boardId,
  pin,
}: {
  boardId: string;
  pin: boolean;
}) => {
  log(
    `Updating board ${boardId} pinned state to ${pin ? "pinned" : "unpinned"}.`
  );
  if (pin) {
    await axios.post(`boards/${boardId}/pin`);
  } else {
    await axios.delete(`boards/${boardId}/pin`);
  }
  return true;
};

export const dismissBoardNotifications = async ({
  boardId,
}: {
  boardId: string;
}) => {
  await axios.post(`boards/${boardId}/notifications/dismiss`);
  return true;
};

export const updateBoardSettings = async (data: {
  slug: string;
  descriptions: BoardDescription[];
  accentColor: string;
  tagline: string;
}): Promise<BoardData> => {
  const response = await axios.post(`/boards/${data.slug}/metadata/update/`, {
    descriptions: data.descriptions,
    accentColor: data.accentColor,
    tagline: data.tagline,
  });
  log(`Updated board settings on server:`);
  log(response.data);
  return response.data;
};

export const getBoardMetadata = async ({
  boardId,
}: {
  boardId: string;
}): Promise<BoardMetadata | null> => {
  const data = (await axios.get(`/boards/${boardId}`))?.data;
  if (!data) {
    error(`Board with id ${boardId} was not found`);
    return null;
  }
  const summary = makeClientBoardSummary(data);
  return {
    ...summary,
    descriptions: data.descriptions,
    permissions: data.permissions
      ? makeClientPermissions(data.permissions)
      : undefined,
    postingIdentities:
      data.posting_identities?.map(makeClientRole) || undefined,
    accessories: data.accessories,
  };
};

export const getAllBoardsData = async (): Promise<BoardData[]> => {
  log(`Fetching all boards data.`);
  const response = await axios.get(`boards`);
  log(`Got response for all boards data.`);
  info(response.data);

  return response.data?.map(makeClientBoardData) || [];
};
