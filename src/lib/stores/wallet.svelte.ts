import type { WalletTab } from '$lib/types';

class WalletStore {
  address = $state('');
  activeTab = $state<WalletTab>('stats');

  setAddress(addr: string) {
    this.address = addr;
    this.activeTab = 'stats';
  }

  setActiveTab(tab: WalletTab) {
    this.activeTab = tab;
  }

  reset() {
    this.address = '';
    this.activeTab = 'stats';
  }
}

export const walletStore = new WalletStore();
export const arcTestnetWalletStore = new WalletStore();
export const simplechainWalletStore = new WalletStore();
export const baseWalletStore = new WalletStore();
export const inkWalletStore = new WalletStore();
export const relayWalletStore = new WalletStore();
export const litvmWalletStore = new WalletStore();
export const seismicWalletStore = new WalletStore();
export const genlayerWalletStore = new WalletStore();
export const jumperWalletStore = new WalletStore();
export const robinhoodWalletStore = new WalletStore();
export const robinhoodTestnetWalletStore = new WalletStore();
export const dachainWalletStore = new WalletStore();
export const domaWalletStore = new WalletStore();
export const layerzeroWalletStore = new WalletStore();
