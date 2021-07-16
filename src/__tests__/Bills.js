import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bill from "../containers/Bills.js";
import Firestore from "../app/Firestore.js";
import {ROUTES} from "../constants/routes.js";
import userEvent from '@testing-library/user-event'

// Container
describe("Given I am connected as an employee", () => {
  describe("When i click on new bill", () => {
    test("Then i should go on the new bill form page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const billContainer = new Bill({ document, onNavigate, Firestore, localStorage: window.localStorage});

      const formTriggered = jest.fn(billContainer.handleClickNewBill);

      const buttonNewBill = screen.getByTestId("btn-new-bill");

      buttonNewBill.addEventListener("click", formTriggered);

      userEvent.click(buttonNewBill);

      expect(formTriggered).toHaveBeenCalled();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })

  describe("WHEN I am on Bills page and I click on an icon eye", () => {
    test("THEN a modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = BillsUI({ data: bills });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const firestore = null;

      const billsContainer = new Bill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getByTestId("icon-eye");
      const handleClickIconEye = jest.fn(
        billsContainer.handleClickIconEye(iconEye)
      );
      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId("modaleFile");

      expect(modale).toBeTruthy();
    });
  });
});

// UI
// TODO regarder le github de Kevin pour l'icone vertical (router.js l-82);
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = BillsUI({ data: [] });

      const billIcon = screen.getByTestId("icon-window");

      expect(billIcon).toBeTruthy();
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

  describe("When I am on Bills page but it is loading", () => {
    test("Then I should land on a loading page", () => {
      const html = BillsUI({ data: [], loading: true });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("WHEN i am on Bills page but an error message has been thrown", () => {
    test("THEN Error page should be rendrered", () => {
      const html = BillsUI({ error: "some error message" });
      document.body.innerHTML = html;

      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});
