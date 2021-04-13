import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Objective} from '../../../data-objects/objective';
import {MatPaginator} from '@angular/material/paginator';
import {PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ObjectivesDataService} from '../../../services/objectives-data-service.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ObjectiveEditComponent} from '../objective-edit/objective-edit.component';
import {ObjectiveListDataSource} from "../../../data-sources/objective-list-datasource";
import {tap} from "rxjs/operators";
import {merge} from "rxjs";
import {MessageService} from "../../../services/message.service";

@Component({
  selector: 'app-objectives',
  templateUrl: './objective-list.component.html',
  styleUrls: ['./objective-list.component.scss']
})
export class ObjectiveListComponent implements OnInit, AfterViewInit  {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource !: ObjectiveListDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name', 'description', 'delete'];

  messages : MessageService = new MessageService();
  total_data_length : number = 10;
  pageEvent : PageEvent = new PageEvent();

  constructor(
    private objectiveService : ObjectivesDataService,
    private dialog: MatDialog,
  ) {
    this.dataSource = new ObjectiveListDataSource(this.objectiveService);
    this.pageEvent.previousPageIndex = -1;
    this.pageEvent.pageIndex = 0;
  }

  ngOnInit() :void {
    this.dataSource = new ObjectiveListDataSource(this.objectiveService);
    this.dataSource.getObjectives();
  }

  ngAfterViewInit(): void {
    // reset the paginator after sorting
    this.messages.log('In the ngAfterViewInit method');

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.dataSource.getObjectives(this.paginator.pageSize, this.pageEvent.previousPageIndex, this.paginator.pageIndex, this.sort.active, this.sort.direction))
      )
      .subscribe();
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      name: 'Enter name here',
      description: 'Enter description here',
    };

    this.dialog.open(ObjectiveEditComponent, dialogConfig);

    const dialogRef = this.dialog.open(ObjectiveEditComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        this.add(data.name, data.description);
      }
    );
  }

  add(
    name: string,
    description: string
  ): void
  {
    // console.log('Before Adding key-results-list in data source');
    name = name.trim();
    if (!name) { return; }
    description = description.trim();
    if (!description) { return; }
    this.dataSource.addObjective({ name: name, description:description } as Objective);

    this.dataSource.getObjectives();
  }

  // TODO Implement back the page refresh and delete functionality for the Objectives list.
  delete(id: number): void {
    // this.dataSource.data = this.dataSource.data.filter(h => h !== objective);
    // console.log('Before deleting key-results-list in data source');
    this.dataSource.deleteObjective(id);
  }

}
