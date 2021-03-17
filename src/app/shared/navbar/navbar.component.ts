import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export enum NavTag {
  HOME = 'HOME',
  VIEW = 'VIEW',
  ADD = 'ADD'
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  navTags = NavTag;

  constructor(
    private readonly router: Router,
  ) { }

  ngOnInit() {}

  onNavigation(tag: NavTag): void {
    if (tag === NavTag.HOME) {
      this.router.navigate(['/']);
    }
    if (tag === NavTag.ADD) {
      this.router.navigate(['/add-single-record']);
    }
    if (tag === NavTag.VIEW) {
      this.router.navigate(['/view-list']);
    }
  }

}
