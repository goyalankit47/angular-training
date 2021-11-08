import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ApiService } from "src/app/shared/api.service";
import { UtilityService } from "src/app/shared/utility.service";
import { PROD_EXTRA } from "src/app/types/prod-extra.type";
import { PRODUCT } from "src/app/types/product.type";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  products: Array<PRODUCT> = [];
  filterTag = "";
  productExtraDetails: { [key: string]: PROD_EXTRA } | null = null;

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Home");
    this.getProductList();
  }

  getProductList() {
    this.apiService.getProducts().subscribe(
      (res: any) => {
        if (res) {
          // validating cart
          this.utilityService.validateCart(res || []);

          this.products = res || [];
          this.products.forEach((prod) => {
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
          });
        }
      },
      (err) => {
        this.utilityService.showErrorToast("Error Fetching Products!");
        console.log(err);
      }
    );
  }

  addItem(product: PRODUCT, event: Event) {
    event.stopImmediatePropagation();
    this.utilityService.addItem(product, (res) => {
      if (res && this.productExtraDetails) {
        this.productExtraDetails[
          product.id.toString()
        ].quantityInCart = this.utilityService.findItem(product?.id).quantity;
      }
    });
  }

  removeItem(product: PRODUCT, event: Event) {
    event.stopImmediatePropagation();
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

  addToCart(product: PRODUCT, event: Event) {
    event.stopImmediatePropagation();
    this.utilityService.addItem(product, (res) => {
      if (res && this.productExtraDetails) {
        this.productExtraDetails[product.id.toString()].quantityInCart = 1;
      }
    });
  }
}
