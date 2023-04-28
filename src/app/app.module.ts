import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { TreeComponent } from './treePrint/tree/tree.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatTreeModule} from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TreeMenuComponent } from './treePrint/menu/tree-menu/tree-menu.component';
import {MatMenuModule} from '@angular/material/menu';
import { EditMenuComponent } from './treePrint/menu/edit-menu/edit-menu.component';
import {MatDialogModule} from "@angular/material/dialog";
import {ReactiveFormsModule } from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { WptDialogComponent } from './treePrint/dialog/wpt-dialog/wpt-dialog.component';
import { MetadataDialogComponent } from './treePrint/dialog/metadata-dialog/metadata-dialog.component';
import { TrkRteDialogComponent } from './treePrint/dialog/trk-rte-dialog/trk-rte-dialog.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { MatTabsModule } from '@angular/material/tabs'; 
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { TreksegDialogComponent } from './treePrint/dialog/trekseg-dialog/trekseg-dialog.component';
import {HttpClientModule} from '@angular/common/http';
import { FileRenameDialogComponent } from './treePrint/dialog/file-rename-dialog/file-rename-dialog.component'
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { ColorPickerModule } from 'ngx-color-picker';
import {MatSelectModule} from '@angular/material/select';
import { MoveToGpxDialogComponent } from './map/move-to-gpx-dialog/move-to-gpx-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TutorialDialogComponent } from './tutorial-dialog/tutorial-dialog.component';
@NgModule({
    declarations: [
        AppComponent,
        MapComponent,
        TreeComponent,
        TreeMenuComponent,
        EditMenuComponent,
        WptDialogComponent,
        MetadataDialogComponent,
        TrkRteDialogComponent,
        TreksegDialogComponent,
        FileRenameDialogComponent,
        MoveToGpxDialogComponent,
        TutorialDialogComponent,
    ],
    //entryComponents:[MoveToGpxDialogComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatTreeModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatToolbarModule,
        FormsModule,
        MatInputModule,
        ScrollingModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        HttpClientModule,
        MatSnackBarModule,
        ColorPickerModule,
        MatSelectModule,
        MatSidenavModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
