import React from "react";
import { useQuery } from "react-query";
import { useAuth } from "../components/Auth";

import debug from "debug";
import { getRealmData } from "../utils/queries/realm";
import { RealmType } from "types/Types";
import { getCurrentRealmSlug } from "utils/location-utils";
//const log = debug("bobafrontend:contexts:RealmContext-log");
const info = debug("bobafrontend:contexts:RealmContext-info");

const RealmContext = React.createContext<
  | {
      realmData: RealmType;
      dataUpdatedAt: number;
    }
  | undefined
>(undefined);

const useRealmContext = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmContext must be used within a RealmContextProvider"
    );
  }
  return context.realmData;
};

const useRealmContextUpdatedAt = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmContext must be used within a RealmContextProvider"
    );
  }
  return context.dataUpdatedAt;
};

const useRealmSettings = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmSettings must be used within a RealmContextProvider"
    );
  }
  return context.realmData.settings;
};

const useRealmBoards = () => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmSettings must be used within a RealmContextProvider"
    );
  }
  return context.realmData.boards;
};

const useBoardSummary = ({ boardId }: { boardId: string }) => {
  const context = React.useContext(RealmContext);
  if (context === undefined) {
    throw new Error(
      "useRealmSettings must be used within a RealmContextProvider"
    );
  }
  return context.realmData.boards.find((summary) => (summary.id = boardId));
};

const RealmContextProvider: React.FC<{
  initialData: RealmType;
  children: React.ReactNode;
}> = ({ initialData, children }) => {
  const realmSlug = getCurrentRealmSlug();
  const { isLoggedIn } = useAuth();
  const { data: realmData, dataUpdatedAt } = useQuery<RealmType>(
    ["realmData", { isLoggedIn, realmSlug }],
    () => {
      info(
        `Fetching realm data for user ${isLoggedIn ? "" : "NOT "}logged in.`
      );
      return getRealmData({ realmSlug });
    },
    {
      initialData: initialData,
      staleTime: Infinity,
      refetchInterval: 60 * 1000,
      refetchOnWindowFocus: true,
      notifyOnChangeProps: ["data", "dataUpdatedAt"],
    }
  );

  return (
    <RealmContext.Provider
      value={React.useMemo(
        () => ({
          realmData: realmData!,
          dataUpdatedAt,
        }),
        [realmData, dataUpdatedAt]
      )}
    >
      {children}
    </RealmContext.Provider>
  );
};
const MemoizedProvider = React.memo(RealmContextProvider);

export {
  MemoizedProvider as RealmContextProvider,
  useRealmContext,
  useRealmSettings,
  useRealmBoards,
  useRealmContextUpdatedAt,
  useBoardSummary,
};
