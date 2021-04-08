import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

import { KeyResult } from '../../../data-objects/key-result';
import {KeyResultDataService} from "../../../services/key-results-data-service.service";

@Component({
  selector: 'app-key-results-search',
  templateUrl: './key-results-search.component.html',
  styleUrls: [ './key-results-search.component.scss' ]
})
export class KeyResultsSearchComponent implements OnInit {
  keyresults$!: Observable<KeyResult[]>;
  private searchTerms = new Subject<string>();

  constructor(private keyresultService: KeyResultDataService) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.keyresults$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.keyresultService.searchKeyResults(term)),
    );
  }
}