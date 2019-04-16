import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MyFilterPipe } from './pipes/my-filter';
import { DisplayCComponent } from './display-c/display-c.component';


@NgModule({
  declarations: [
    AppComponent,
    DisplayCComponent,
	MyFilterPipe
  ],
  imports: [
    BrowserModule,
	HttpClientModule,
    AppRoutingModule,
	FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent,DisplayCComponent]
})
export class AppModule { }
