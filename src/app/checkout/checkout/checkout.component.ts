import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Papa } from "ngx-papaparse";
import { ApiService } from "src/app/shared/api.service";
import { UtilityService } from "src/app/shared/utility.service";
import { CART_ITEM } from "src/app/types/cart-item.type";
import { PROD_EXTRA } from "src/app/types/prod-extra.type";
import { PRODUCT } from "src/app/types/product.type";

@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit {
  totalItems: number = 0;
  totalAmount: number = 0;
  products: Array<PRODUCT> = [];
  productExtraDetails: { [key: string]: PROD_EXTRA } | null = null;
  isCartEmpty: boolean = false;

  @ViewChild("dummyAnchor")
  dummyAnchor!: ElementRef;

  constructor(
    private router: Router,
    private utilityService: UtilityService,
    private apiService: ApiService,
    private papa: Papa,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Checkout");
    this.getProductList();
  }

  getProductList() {
    this.apiService.getProducts().subscribe(
      (res: any) => {
        if (res) {
          // validating cart
          this.utilityService.validateCart(res || []);

          const cartItems: Array<CART_ITEM> = this.utilityService.getCartItems();
          if (!cartItems.length) {
            this.isCartEmpty = true;
            return;
          }

          cartItems.forEach((item) => {
            const prod = (res || []).find(
              (product: PRODUCT) => product.id === item.id
            );

            this.products.push(prod);

            let quantity = 0;
            // check for quantity of prod in cart
            if (this.utilityService.findItemIndex(prod.id) >= 0) {
              quantity = this.utilityService.findItem(prod?.id).quantity;
            }

            this.productExtraDetails = {
              ...this.productExtraDetails,
              [prod.id.toString()]: {
                offPercentage: Math.round(
                  ((+prod?.compare_at_price - +prod?.price) /
                    +prod?.compare_at_price) *
                    100
                ),
                quantityInCart: quantity,
              },
            };

            // setting payment vars
            this.totalItems += item.quantity;
            this.totalAmount += item.quantity * Number(prod?.price);
          });
        }
      },
      (err) => {
        this.utilityService.showErrorToast("Error Fetching Products!");
        console.log(err);
      }
    );
  }

  addItem(product: PRODUCT) {
    this.utilityService.addItem(product, (res) => {
      if (res && this.productExtraDetails) {
        this.productExtraDetails[
          product.id.toString()
        ].quantityInCart = this.utilityService.findItem(product?.id).quantity;
      }
    });
  }

  removeItem(product: PRODUCT) {
    this.utilityService.deleteItem(product, (res) => {
      if (res && this.productExtraDetails) {
        if (this.utilityService.findItemIndex(product?.id) < 0) {
          this.productExtraDetails[product.id.toString()].quantityInCart = 0;
        } else {
          this.productExtraDetails[
            product.id.toString()
          ].quantityInCart = this.utilityService.findItem(product?.id).quantity;
        }
      }
    });
  }

  handleDeleteButton(product: PRODUCT) {
    const itemQuantity = this.utilityService.findItem(product?.id).quantity;
    this.utilityService.deleteProduct(product.id, (res) => {
      if (res) {
        this.checkIfCartEmpty();

        // remove from products
        this.products = this.products.filter((item) => item.id !== product.id);

        // setting payment vars
        this.totalItems -= itemQuantity;
        this.totalAmount -= Number(product.price) * itemQuantity;
      }
    });
  }

  checkIfCartEmpty() {
    if (this.utilityService.getCartItems().length === 0) {
      this.isCartEmpty = true;
    }
  }

  downloadOrder() {
    if (this.utilityService.checkIfUserAuthenticated()) {
      this.utilityService.validateCart(this.products);
      const cartItems: Array<CART_ITEM> = this.utilityService.getCartItems();

      const headersKeyMap: { [key: string]: string } = {
        id: "Product ID",
        vendor: "Vendor",
        name: "Name",
        price: "Price",
        tag: "Product Tag",
        quantity: "Quantity",
      };
      const keysToShow = ["id", "vendor", "name", "price", "tag", "quantity"];

      // creating an array of rows need to download
      const rows = cartItems.map((item) => {
        let temp = {};
        const product = this.products.find((product) => product.id === item.id);

        Object.entries(product || {}).forEach(([key, value]) => {
          if (keysToShow.indexOf(key) !== -1) {
            temp = {
              ...temp,
              [headersKeyMap[key]]: key === "price" ? `$${value}` : value,
            };
          }
        });
        temp = {
          ...temp,
          Quantity: item.quantity,
        };
        return temp;
      });

      // JSON array to csv
      const csv = this.papa.unparse(rows);

      // converting to a blob file
      const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      let csvURL = null;
      csvURL = window.URL.createObjectURL(csvData);

      // temp element to download
      this.dummyAnchor.nativeElement.href = csvURL;
      this.dummyAnchor.nativeElement.click();

      this.utilityService.showSuccessToast(
        "Order Place & Downloaded Successfully!"
      );

      // empty cart and navigate to home
      this.utilityService.clearCart();
      this.router.navigate(["/"]);
    }
  }
}
