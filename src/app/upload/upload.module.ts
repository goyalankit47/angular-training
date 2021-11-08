import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UploadComponent } from "./upload/upload.component";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../shared/shared.module";

const routes: Routes = [
  {
    path: "",
    component: UploadComponent,
  },
];

@NgModule({
  declarations: [UploadComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class UploadModule {}
