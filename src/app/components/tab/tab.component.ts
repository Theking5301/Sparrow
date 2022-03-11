import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BrowserManagerService } from '../../services/browser-manager/browser-manager.service';
import { UserDataService } from '../../services/user-data-service/user-data-service.service';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input()
  public active: boolean;
  @Input()
  public tabId: string;
  @Output()
  public tabselected: EventEmitter<string>;

  constructor(private userData: UserDataService, private manager: BrowserManagerService) {
    this.tabselected = new EventEmitter();
  }

  ngOnInit(): void {
  }
  public tabClicked(e): void {
    this.tabselected.emit(this.tabId);
  }
  public tabAuxClicked(e): void {
    if (e.button === 1) {
      this.closeTab();
    }
  }
  public mouseDown(e) {
    if (e.button === 1) {
      e.preventDefault();
    }
  }
  public closeTab(): void {
    this.manager.removeTab(this.tabId);
  }
  public getTabName(): string {
    return this.userData.getUserData().getTab(this.tabId)?.getInstances()[0].getTitle();
  }
  public getTabIconUrl(): string {
    return this.userData.getUserData().getTab(this.tabId)?.getInstances()[0].getIcon();
  }
}
