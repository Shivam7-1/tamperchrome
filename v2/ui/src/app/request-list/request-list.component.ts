import { Component, Directive, OnInit, Output, EventEmitter, ViewChild, ViewChildren, QueryList, ElementRef, Input } from '@angular/core';
import { FocusKeyManager, FocusableOption, ListKeyManagerOption } from '@angular/cdk/a11y';
import { MatTableDataSource } from '@angular/material/table';
import { InterceptorService, InterceptorRequest } from '../../interceptor.service';
import { MatTable } from '@angular/material/table';


@Directive({
	selector: '[app-request-list-item]',
})
export class RequestListItem implements FocusableOption, ListKeyManagerOption {
	constructor(public el: ElementRef<any>) { }

	@Input() disabled = false;
	@Input() request: InterceptorRequest = null;
	focus() {
		this.el.nativeElement.focus();
	}

	getLabel() {
		return this.request.method + ' ' + this.request.path + this.request.query;
	}
}

@Component({
	selector: 'app-request-list',
	templateUrl: './request-list.component.html',
	styleUrls: ['./request-list.component.scss'],
})
export class RequestListComponent implements OnInit {

	constructor(private interceptor: InterceptorService) { }
	@Output()
	selected = new EventEmitter<InterceptorRequest>();

	requests: InterceptorRequest[] = this.interceptor.requests;
	displayedColumns: Array<string> = ['method', 'host', 'pathquery', 'type', 'status'];
	dataSource: MatTableDataSource<InterceptorRequest> = new MatTableDataSource(this.requests);
	keyManager: FocusKeyManager<RequestListItem> = null;
	@ViewChildren(RequestListItem) listItems: QueryList<RequestListItem>;
	@ViewChild(MatTable, { static: true }) table: MatTable<any>;
	ngOnInit() { this.updateTable(); }
	ngAfterViewInit() {
		this.keyManager = new FocusKeyManager(this.listItems).withHomeAndEnd().withTypeAhead();
		this.keyManager.updateActiveItem(0);
		this.keyManager.change.subscribe({
			next: (v) => this.selected.emit(this.requests[v])
		});
	}
	async updateTable() {
		for await (const change of this.interceptor.changes) {
			this.table.renderRows();
			this.selected.emit(this.requests[this.keyManager.activeItemIndex]);
		}
	}
}
