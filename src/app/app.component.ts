import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "./shared/api.service";
import { UtilityService } from "./shared/utility.service";
import { CART_ITEM } from "./types/cart-item.type";
import { USER } from "./types/user.type";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "increff-training";
  cartItemsCount = 0;
  username: string = "username";
  dateTime: string = new Date().toString();

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService,
    public router: Router
  ) {
    this.getDateTime();
  }

  ngOnInit() {
    if (this.utilityService.checkIfUserAuthenticated()) {
      this.setCartQuantity();
      this.listenStorageChange();
      this.showUserName();
      // subscribing cart change
      this.utilityService.cartChange.subscribe((res) => {
        if (res) {
          this.setCartQuantity();
        }
      });
    }
  }

  logout() {
    this.utilityService.logout();
  }

  // handles finding and showing username
  showUserName() {
    this.apiService.getUsers().subscribe(
      (res: any) => {
        if (res) {
          const user = res.find(
            (item: USER) =>
              item?.id === Number(localStorage.getItem("userId") || "-1")
          );
          if (user) {
            this.username = user.name;
          } else {
            this.logout();
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  // handles change in cartItems
  listenStorageChange = () => {
    window.onstorage = (ev) => {
      // it got fired only on the page other than current page of the same domain
      window.location.reload();
    };
  };

  // setting cart quantity in header
  setCartQuantity() {
    let quantity = 0;
    this.utilityService.getCartItems().forEach((element: CART_ITEM) => {
      quantity += +element.quantity;
    });
    this.cartItemsCount = quantity;
  }

  getDateTime() {
    setInterval(() => {
      this.dateTime = new Date().toString();
    }, 1000);
  }
}
