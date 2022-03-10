import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BrowserInstance, BrowserTab, UserData } from '../../../../app/models/UserData';
import { PascoElectronService } from '../pasco-electron/pasco-electron.service';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private userData: UserData;

  constructor(private electron: PascoElectronService) {
    this.userData = new UserData();
  }

  public getUserData(): UserData {
    return this.userData;
  }
  public initialize(): Promise<void> {
    return new Promise((resolve) => {
      this.electron.ipcRenderer.send('pasco/user-data');
      this.electron.ipcRenderer.on('pasco/user-data', (event, data) => {
        if (!data || !data.tabs || data.tabs.length === 0) {
          this.userData = this.createDefaultUserData();
          this.syncToDataAccess();
        } else {
          this.userData = new UserData(data);
        }
        resolve();
      });
    });
  }
  public syncToDataAccess() {
    this.electron.ipcRenderer.send('pasco/user-data/update', this.userData);
  }
  private createDefaultUserData(): UserData {
    return new UserData({
      version: 1,
      tabs: [
        new BrowserTab({
          name: 'DefaultTab',
          id: uuidv4(),
          instances: [
            new BrowserInstance({
              id: uuidv4(),
              url: 'https://www.google.com'
            })
          ]
        })
      ]
    });
  }
}
