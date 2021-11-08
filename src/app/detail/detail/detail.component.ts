import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "src/app/shared/api.service";
import { UtilityService } from "src/app/shared/utility.service";
import { PROD_EXTRA } from "src/app/types/prod-extra.type";
import { PRODUCT } from "src/app/types/product.type";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class DetailComponent implements OnInit {
  product: PRODUCT | null = null;
  productExtraDetails: PROD_EXTRA | null = null;
  notFound: boolean = false;
  productId: number = -1;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private utilityService: UtilityService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Detail");

    this.productId = +(
      this.route.snapshot.queryParamMap.get("product_id") || 0
    );
    if (this.productId) {
      this.getProducts();
    } else {
      this.notFound = true;
    }
  }

  getProducts() {
    this.apiService.getProducts().subscribe(
      (res: any) => {
        if (res) {
          // validating cart
          this.utilityService.validateCart(res || []);

          this.product = (res || []).find(
            (item: PRODUCT) => item.id === this.productId
          );

          if (!this.product) {
            this.notFound = true;
            return;
          }

          let quantity = 0;
          if (this.utilityService.findItemIndex(this.product.id) >= 0) {
            quantity = this.utilityService.findItem(this.product?.id).quantity;
          }

          this.productExtraDetails = {
            offPercentage: Math.round(
              ((+this.product?.compare_at_price - +this.product?.price) /
                +this.product?.compare_at_price) *
                100
            ),
            quantityInCart: quantity,
          };
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
        this.productExtraDetails.quantityInCart = this.utilityService.findItem(
          product?.id
        ).quantity;
      }
    });
  }

  removeItem(product: PRODUCT) {
    this.utilityService.deleteItem(product, (res) => {
      if (res && this.productExtraDetails) {
        if (this.utilityService.findItemIndex(product?.id) < 0) {
          this.productExtraDetails.quantityInCart = 0;
        } else {
          this.productExtraDetails.quantityInCart = this.utilityService.findItem(
            product?.id
          ).quantity;
        }
      }
    });
  }

  addToCart(product: PRODUCT) {
    this.utilityService.addItem(product, (res) => {
      if (res && this.productExtraDetails) {
        this.productExtraDetails.quantityInCart = 1;
      }
    });
  }
}
