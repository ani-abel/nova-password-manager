import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewSinglePageRoutingModule } from './view-single-routing.module';

import { ViewSinglePage } from './view-single.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ViewSinglePageRoutingModule
  ],
  declarations: [ViewSinglePage]
})
export class ViewSinglePageModule {}
