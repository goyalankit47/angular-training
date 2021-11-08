import { HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { USER } from "src/app/types/user.type";
import { ApiService } from "../api.service";
import { UtilityService } from "../utility.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  email = "";
  password = "";
  showErrorMsg = false;

  constructor(
    private apiService: ApiService,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {}

  onLogin(event: any) {
    event.preventDefault();
    console.log("check", event);
    this.apiService.getUsers().subscribe(
      (res: any) => {
        if (res) {
          const user = res.find((item: USER) => item.email === this.email);
          if (user && user?.password === this.password) {
            this.showErrorMsg = false; // remove error if any
            // clearCart(); // clearing cart data if any
            localStorage.setItem("userId", user.id); // setting user id for checking authorization
            this.utilityService.showSuccessToast("Successfully Logged In!");
            window.location.reload();
          } else {
            // Show error message in case of wrong email or password
            this.showErrorMsg = true;
          }
        }
      },
      (err) => {
        this.utilityService.showErrorToast("Something went wrong!");
        console.log(err);
      }
    );
  }
}
