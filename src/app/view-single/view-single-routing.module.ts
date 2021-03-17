import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewSinglePage } from './view-single.page';

const routes: Routes = [
  {
    path: '',
    component: ViewSinglePage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class ViewSinglePageRoutingModule { }
