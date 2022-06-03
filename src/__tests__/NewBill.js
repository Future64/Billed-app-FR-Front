import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import Store from "../app/Store.js";
import { ROUTES_PATH } from "../constants/routes.js";
import data from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("And I upload a image file", () => {
    test("Then the file handler should show a file", () => {
      document.body.innerHTML = NewBillUI();
      // const onNavigate = ROUTES_PATH.NewBill;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );
      const newBill = new NewBill({
        document,
        onNavigate,
        store: data,
        localStorage: window.localStorage,
      });
      const simulChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", simulChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["something"], "something.txt", { type: "text/txt" }),
          ],
        },
      });
      const numberOfFile = screen.getByTestId("file").files.length;
      expect(numberOfFile).toEqual(1);
    });
  });
});

// Test d'integration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I m in Bills page", () => {
    test(" I fetche new bill from mock API POST", async () => {
      jest.mock("../app/Store");
      const email = "employee@test.tld";
      const bill = {
        email,
        type: "Employee",
        name: "Max test",
        amount: 45,
        date: "2022/05/30",
        vat: 10,
        pct: 10,
        commentary: "Success Request",
        fileUrl: "max/photo/image.jpeg",
        fileName: "image.jpeg",
        status: "pending",
      };
      Store.bill = () => ({ bill, post: jest.fn().mockResolvedValue() });
      const getSpy = jest.spyOn(Store, "bill");
      const postReturn = Store.bill(bill);
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(postReturn.bill).toEqual(bill);
    });
  });
});
