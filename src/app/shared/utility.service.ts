import { Injectable } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { Subject } from "rxjs";
import { LoginComponent } from "src/app/shared/login/login.component";
import { CART_ITEM } from "../types/cart-item.type";
import { PRODUCT } from "../types/product.type";

@Injectable({
  providedIn: "root",
})
export class UtilityService {
  cartChange = new Subject<boolean>();
  loginModalRef: any;

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService
  ) {}

  checkIfUserAuthenticated(): boolean {
    if (localStorage.getItem("userId")) {
      return true;
    }
    if (!this.loginModalRef) {
      this.openLoginModal();
    }
    return false;
  }

  openLoginModal() {
    // clearing localstorage before loginset
    localStorage.clear();

    this.loginModalRef = this.modalService.show(LoginComponent, {
      backdrop: "static",
      keyboard: false,
    });
  }

  showSuccessToast(message: string) {
    this.toastr.success(message, "Success");
  }

  showErrorToast(message: string) {
    this.toastr.error(message, "Error", {
      timeOut: 0,
      extendedTimeOut: 0,
    });
  }

  // Adding items in cart
  addItem(item: PRODUCT, callback: (arg0: boolean) => void) {
    if (this.checkIfUserAuthenticated()) {
      const tempItems = this.getCartItems();
      const index = this.findItemIndex(item.id);
      if (index < 0) {
        tempItems.push({
          id: item.id,
          quantity: 1,
        });
      } else {
        if (
          !Number(tempItems[index]?.quantity) ||
          tempItems[index]?.quantity <= 0
        ) {
          tempItems[index].quantity = 0;
        }
        tempItems[index].quantity += 1;
      }
      this.setCartItems(tempItems, "Item Added!");
      callback(true);
    }
  }

  // Delete item from cart
  deleteItem(item: PRODUCT, callback: (arg0: boolean) => void) {
    if (this.checkIfUserAuthenticated()) {
      const tempItems = this.getCartItems();
      const index = this.findItemIndex(item.id);
      if (index < 0) {
      } else {
        tempItems[index].quantity -= 1;
        if (
          !Number(tempItems[index]?.quantity) ||
          tempItems[index]?.quantity <= 0
        ) {
          tempItems.splice(index, 1);
        }
      }
      this.setCartItems(tempItems, "Item Removed!");
      callback(true);
    }
  }

  // Delete whole product from cart
  deleteProduct(
    itemId: number,
    callback: (arg0: boolean) => void,
    noToast = false
  ) {
    if (this.checkIfUserAuthenticated()) {
      const tempItems = this.getCartItems();
      const index = this.findItemIndex(itemId);
      if (index < 0) {
      } else {
        tempItems[index].quantity = 0;
        tempItems.splice(index, 1);
      }
      this.setCartItems(tempItems, !noToast ? "Item Removed" : undefined);
      callback(true);
    }
  }

  // find item index in cart
  findItemIndex(itemId: number) {
    return this.getCartItems().findIndex(
      (item: CART_ITEM) => item.id === itemId
    );
  }

  // find item in cart
  findItem(itemId: number) {
    return this.getCartItems().find((item: CART_ITEM) => item.id === itemId);
  }

  // get items from cart
  getCartItems() {
    try {
      return JSON.parse(localStorage.getItem("cartItems") || "[]");
    } catch (e) {
      this.setCartItems([]);
      return [];
    }
  }

  // set cart items
  setCartItems(items: Array<CART_ITEM>, toastMsg?: string) {
    if (this.checkIfUserAuthenticated()) {
      if (toastMsg) {
        this.showSuccessToast(toastMsg);
      }
      localStorage.setItem("cartItems", JSON.stringify(items));
      this.cartChange.next(true);
    }
  }

  // validating cart for unintended entries
  validateCart(products: Array<PRODUCT>) {
    this.getCartItems().forEach((item: CART_ITEM) => {
      // check if id is present in product list
      if (
        !products.find((pro) => pro.id === item.id) ||
        !Number.isInteger(item.quantity) ||
        Number(item.quantity) <= 0
      ) {
        this.deleteProduct(item.id, () => {}, true);
      }
    });
  }

  // clear cart from ls
  clearCart() {
    localStorage.removeItem("cartItems");
  }

  logout() {
    localStorage.clear();
    window.location.href = "/";
  }
}
