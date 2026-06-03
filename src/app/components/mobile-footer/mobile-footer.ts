import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mobile-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mobile-footer.html',
  styleUrl: './mobile-footer.css'
})
export class MobileFooter {}
