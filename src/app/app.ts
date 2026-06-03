import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './components/nav-bar/nav-bar';
import { MobileFooter } from './components/mobile-footer/mobile-footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, MobileFooter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
