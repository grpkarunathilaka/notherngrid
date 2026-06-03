import { Component, OnInit } from '@angular/core';
import { SchemaService } from '../../services/schema.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements OnInit {
  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    // Injects LocalBusiness schema to head
    this.schemaService.injectSchema();
  }
}
