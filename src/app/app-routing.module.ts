import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./auth.guard";

const routes: Routes = [
  {
    path: "",
    loadChildren: () => import("./home/home.module").then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: "details",
    loadChildren: () =>
      import("./detail/detail.module").then((m) => m.DetailModule),
    canActivate: [AuthGuard],
  },
  {
    path: "checkout",
    loadChildren: () =>
      import("./checkout/checkout.module").then((m) => m.CheckoutModule),
    canActivate: [AuthGuard],
  },
  {
    path: "upload",
    loadChildren: () =>
      import("./upload/upload.module").then((m) => m.UploadModule),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
