import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Papa } from "ngx-papaparse";
import { ApiService } from "src/app/shared/api.service";
import { UtilityService } from "src/app/shared/utility.service";
import { PRODUCT } from "src/app/types/product.type";

@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.scss"],
})
export class UploadComponent implements OnInit {
  showTable: boolean = false;
  errorsArr: Array<string> = [];
  tableData: Array<Array<string | number>> = [];
  products: Array<PRODUCT> = [];
  tableHeader = ["Product ID", "Quantity"];
  @ViewChild("dummyAnchor") dummyAnchor!: ElementRef;

  constructor(
    private title: Title,
    private utilityService: UtilityService,
    private apiService: ApiService,
    private papa: Papa
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Upload");
    this.getProductData();
  }

  getProductData() {
    this.apiService.getProducts().subscribe(
      (res: any) => {
        if (res) {
          this.products = res || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  downloadTemplate() {
    if (this.utilityService.checkIfUserAuthenticated()) {
      const rows = [this.tableHeader];
      // JSON array to csv
      const csv = this.papa.unparse(rows);

      // converting to a blob file
      const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      let csvURL = null;
      csvURL = window.URL.createObjectURL(csvData);

      // temp element to download
      this.dummyAnchor.nativeElement.href = csvURL;
      this.dummyAnchor.nativeElement.click();

      this.utilityService.showSuccessToast("Template Downloaded Successfully!");
    }
  }

  resetTableVars() {
    this.showTable = false;
    this.errorsArr = [];
    this.tableData = [];
  }

  handleFileChange(event: any) {
    const file = event.target.files[0];

    if (this.utilityService.checkIfUserAuthenticated()) {
      // reset vars on file change
      this.resetTableVars();

      this.papa.parse(file, {
        skipEmptyLines: 'greedy',
        dynamicTyping: true, // to preserve data type of columns
        complete: this.processCSVParse.bind(this),
        // before: (_file: any, inputElement: any) => {

        //   // validating for file type (must be csv only)
        //   const ext = inputElement.value.match(/\.([^\.]+)$/);
        //   if (!ext || ext[1] !== "csv") {
        //     return {
        //       action: "abort",
        //       reason: "File type must be CSV only!",
        //     };
        //   }
        // },
        error: (error: any, file: any) => {
          this.utilityService.showErrorToast(error);
        },
      });
    }
  }

  processCSVParse(res: any) {
    // check if file is empty
    if (res.data.length < 2) {
      this.utilityService.showErrorToast("Uploaded File has no data!");
      return;
    }

    // parse complete data and show all the possible errors
    const orderItems: { id: number; quantity: number }[] = [];

    // Match header array to required one
    const dataHeader = res?.data[0];
    if (dataHeader.length !== this.tableHeader.length) {
      this.errorsArr.push(
        `Header Error : Number of columns in CSV header doesn't match with the required one.`
      );
    } else {
      this.tableHeader.forEach((item, index) => {
        if (
          !dataHeader[index] ||
          dataHeader[index].toLowerCase() !== item.toLowerCase()
        ) {
          this.errorsArr.push(
            `Header : Column ${index + 1} of CSV Header must be '${item}'.`
          );
        }
      });
    }

    // Traverse every row and validate
    res?.data.slice(1).forEach((row: any, i: number) => {
      if (row.length > this.tableHeader.length) {
      } else {
        let rowHasError = true;
        row.forEach((data: any, idx: number) => {
          if (!data && typeof data !== "number") {
            this.errorsArr.push(
              `Row_${i + 2} : Column ${
                this.tableHeader[idx]
              } of row cannot be empty.`
            );
          } else if (!Number.isInteger(data)) {
            this.errorsArr.push(
              `Row_${i + 2} : Column ${
                this.tableHeader[idx]
              } of row contains value '${data}'. It must contain some numeric value.`
            );
          } else if (Number(data) <= 0) {
            this.errorsArr.push(
              `Row_${i + 2} : Column ${
                this.tableHeader[idx]
              } of row must contain value greater than zero.`
            );
          } else if (
            idx == 0 &&
            !this.products.find((pro) => pro.id === Number(data))
          ) {
            this.errorsArr.push(
              `Row_${i + 2} : Product with Product ID '${data}' doesn't exists.`
            );
          } else {
            rowHasError = false;
          }
        });
        if (!rowHasError) {
          const index = orderItems.findIndex(
            (item) => item.id === Number(row[0])
          );
          if (index < 0) {
            orderItems.push({
              id: Number(row[0]),
              quantity: Number(row[1]),
            });
          } else {
            orderItems[index].quantity += Number(row[1]);
          }
        }
      }
    });

    // if error div is empty, show success toast and table else show error toast
    if (this.errorsArr.length) {
      this.utilityService.showErrorToast(
        "There are errors with the provided CSV!"
      );
    } else {
      // create table body
      orderItems.forEach((row, i) => {
        const productItem = this.products.find(
          (item) => item.id === Number(row.id)
        );
        this.tableData.push([
          row.id,
          productItem?.vendor || "",
          productItem?.name || "",
          productItem?.price || "",
          productItem?.tag || "",
          row.quantity,
        ]);
      });

      this.utilityService.showSuccessToast("CSV Uploaded Successfully!");
      // remove d-none from table
      this.showTable = true;
    }
  }
}
