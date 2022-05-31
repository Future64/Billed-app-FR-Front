/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import data from "../__mocks__/store.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then iconEye button exist", () => {
      /*----- MAX*/
      document.body.innerHTML = BillsUI({ data: bills });
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy();
    });
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  /* Testing that when the eye icon is clicked, a modal should open. ----- MAX*/
  describe("And I click on the eye icon", () => {
    test("A modal should open", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const newBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      newBills.handleClickIconEye = jest.fn();
      screen.getAllByTestId("icon-eye")[0].click();
      expect(newBills.handleClickIconEye).toBeCalled();
      expect(document.getElementById("modaleFile")).toBeTruthy();
      expect(screen.getAllByText("Justificatif")).toBeTruthy();
    });
  });

  // Test d'integration GET
  describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills page", () => {
      test("fetches bills from mock API GET", async () => {
        const simulGetRequest = jest.spyOn(data, "get");
        const bills = await data.get();
        document.body.innerHTML = BillsUI({ data: bills.data });
        const tbody = screen.getByTestId("tbody");
        expect(simulGetRequest).toHaveBeenCalledTimes(1);
        expect(tbody).toBeTruthy();
        expect(document.querySelectorAll("tbody tr").length).toBe(4);
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        data.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        );
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      test("fetches messages from an API and fails with 500 message error", async () => {
        data.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
        );
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
