import { Client, getBoardRouter, getThreadRouter } from "./utils";
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

import BoardPage from "pages/[boardId]/index";
import { FAVORITE_CHARACTER_TO_MAIM_THREAD } from "../server-mocks/data/thread";
import React from "react";
import ThreadPage from "pages/[boardId]/thread/[...threadId]";
import userEvent from "@testing-library/user-event";

jest.mock("components/hooks/usePreventPageChange");
jest.mock("components/hooks/useIsChangingRoute");
jest.mock("components/hooks/useOnPageExit");

beforeAll(() => {
  document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = () => {
      return {
        x: 0,
        y: 0,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        toJSON: jest.fn(),
      };
    };

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    };

    return range;
  };
});

const getPostByTextContent = async (textContent: string) => {
  return (await screen.findByText(textContent))?.closest("article");
};
export const TagMatcher = (tagText: string) => {
  return (_: string, node: HTMLElement) => {
    return node.textContent === tagText && node.classList.contains("tag");
  };
};

describe("PostEditor", () => {
  it("renders post after creating new thread", async () => {
    render(
      <Client router={getBoardRouter({ boardSlug: "gore" })}>
        <BoardPage />
      </Client>
    );

    fireEvent.click(document.querySelector(".fab-clickable-area")!);
    await waitFor(() => {
      expect(screen.getByText("Random Identity")).toBeInTheDocument();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    );
    expect(editorContainer).toBeInTheDocument();
    userEvent.type(editorContainer!, "bar");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    const mainContainer = document.querySelector<HTMLElement>(".content .main");
    await waitForElementToBeRemoved(
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar")).toBeInTheDocument();
    });
  });

  it("renders post after creating new thread (as role)", async () => {
    render(
      <Client router={getBoardRouter({ boardSlug: "gore" })}>
        <BoardPage />
      </Client>
    );

    fireEvent.click(document.querySelector(".fab-clickable-area")!);
    await waitFor(() => {
      expect(screen.getByText("Random Identity")).toBeInTheDocument();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    )!;
    // Click on the identity selection dropdown
    await within(modal!).findByLabelText("Select visible identity");
    fireEvent.click(within(modal!).getByLabelText("Select visible identity"));

    // Select the GoreMaster5000 identity
    const popover = document.querySelector<HTMLElement>(
      ".react-tiny-popover-container"
    );
    const identityInSelector = await within(popover!).findByText(
      "GoreMaster5000"
    );
    fireEvent.click(identityInSelector);

    userEvent.type(editorContainer!, "bar");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    await waitForElementToBeRemoved(
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    const post = await getPostByTextContent("bar");
    expect(within(post!).getByText("GoreMaster5000")).toBeVisible();
  });

  it("renders post after updating tags", async () => {
    render(
      <Client router={getBoardRouter({ boardSlug: "gore" })}>
        <BoardPage />
      </Client>
    );
    const post = await getPostByTextContent(
      "Favorite murder scene in videogames?"
    );
    fireEvent.click(within(post!).getByLabelText("Post options"));
    const popover = document.querySelector<HTMLElement>(
      ".react-tiny-popover-container"
    );
    fireEvent.click(await within(popover!).findByText("Edit tags")!);

    const tagsInput = await screen.findByLabelText("The tags input area");
    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    expect(within(modal!).getByText("bruises")).toBeVisible();

    fireEvent.click(tagsInput!);
    userEvent.type(tagsInput!, "a new tag{enter}");
    userEvent.type(tagsInput!, "+a new category{enter}");
    userEvent.type(tagsInput!, "cn: a new warning{enter}");
    userEvent.type(tagsInput!, "#a new search tag{enter}");

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    await waitForElementToBeRemoved(
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    const updatedPost = await getPostByTextContent(
      "Favorite murder scene in videogames?"
    );
    expect(
      screen.getByText(TagMatcher("cn:a new warning"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("»mwehehehehe"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("»a new tag"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("+blood"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("+bruises"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("+a new category"))
    ).toBeInTheDocument();
    expect(
      within(updatedPost!).getByText(TagMatcher("#a new search tag"))
    ).toBeInTheDocument();
  });

  it("renders post after replying to thread", async () => {
    render(
      <Client
        router={getThreadRouter({
          boardSlug: "gore",
          threadId: FAVORITE_CHARACTER_TO_MAIM_THREAD.id,
        })}
      >
        <ThreadPage />
      </Client>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Contribute")[0]).toBeInTheDocument();
    });
    fireEvent.click(
      document.querySelector<HTMLElement>(
        "article .footer-actions .button:first-child button"
      )!
    );

    await waitFor(() => {
      expect(screen.getByText("Post")).toBeInTheDocument();
    });

    const modal = document.querySelector<HTMLElement>(".ReactModalPortal");
    const editorContainer = document.querySelector<HTMLElement>(
      ".ReactModalPortal .ql-editor"
    );
    expect(editorContainer).toBeInTheDocument();
    userEvent.type(editorContainer!, "bar");

    await waitFor(() => {
      expect(within(modal!).getByLabelText("Submit")).not.toBeDisabled();
    });

    fireEvent.click(within(modal!).getByLabelText("Submit"));

    const mainContainer = document.querySelector<HTMLElement>(".content .main");
    await waitForElementToBeRemoved(() =>
      document.querySelector<HTMLElement>(".ReactModalPortal .ql-editor")
    );
    await waitFor(() => {
      expect(within(mainContainer!).getByText("bar")).toBeInTheDocument();
    });
  });
});