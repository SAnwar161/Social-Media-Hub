import { DeviceEventEmitter } from 'react-native';

class ShareQueueService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // item: { content: string, mediaUris: string[], platform: string, status: 'pending'|'processing'|'completed'|'failed' }
  addShare(content, mediaUris, platforms) {
    const newItems = platforms.map(p => ({
      id: Math.random().toString(36).substr(2, 9),
      content,
      mediaUris,
      platform: p,
      status: 'pending',
      createdAt: Date.now()
    }));
    
    this.queue = [...this.queue, ...newItems];
    this.emitChange();
    this.processNext();
  }

  getQueue() {
    return this.queue;
  }

  removeShare(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.emitChange();
  }

  markProcessing(id) {
    const item = this.queue.find(i => i.id === id);
    if (item) {
      item.status = 'processing';
      this.emitChange();
    }
  }

  markCompleted(id) {
    const item = this.queue.find(i => i.id === id);
    if (item) {
      item.status = 'completed';
      this.emitChange();
      // Auto-remove completed items after a short delay for UX
      setTimeout(() => {
        this.removeShare(id);
        this.isProcessing = false;
        this.processNext();
      }, 1500);
    }
  }

  markFailed(id) {
    const item = this.queue.find(i => i.id === id);
    if (item) {
      item.status = 'failed';
      this.emitChange();
      setTimeout(() => {
        this.removeShare(id);
        this.isProcessing = false;
        this.processNext();
      }, 1500);
    }
  }

  clearQueue() {
    this.queue = [];
    this.isProcessing = false;
    this.emitChange();
  }

  processNext() {
    if (this.isProcessing) return;
    
    const nextItem = this.queue.find(item => item.status === 'pending');
    if (!nextItem) return;

    this.isProcessing = true;
    this.markProcessing(nextItem.id);
    DeviceEventEmitter.emit('process-share-queue-item', nextItem);
  }

  finishProcessing() {
    this.isProcessing = false;
    this.processNext();
  }

  emitChange() {
    DeviceEventEmitter.emit('share-queue-updated', [...this.queue]);
  }
}

export default new ShareQueueService();
