import { connect } from "mongoose";

/**
 * 資料庫連線管理類
 * 負責MongoDB連線的初始化和管理
 */
export class ConnectionManager {
  private static instance: ConnectionManager;
  private DB!: typeof import("mongoose");
  private isConnected: boolean = false;
  private connectionUrl: string = "";

  private constructor() {}

  /**
   * 獲取ConnectionManager單例實例
   */
  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * 初始化資料庫連線
   * @param url MongoDB連線URL
   */
  async connect(url: string): Promise<void> {
    if (this.isConnected && this.connectionUrl === url) {
      console.log(`[ConnectionManager] 已連線到資料庫: ${url}`);
      return;
    }

    try {
      this.DB = await connect(url);
      this.isConnected = true;
      this.connectionUrl = url;
      console.log(`[ConnectionManager] 成功連線到資料庫: ${url}`);
    } catch (error) {
      this.isConnected = false;
      console.error(`[ConnectionManager] 無法連線到資料庫 ${url}:`, error);
      throw error;
    }
  }

  /**
   * 獲取資料庫實例
   */
  getDB(): typeof import("mongoose") {
    if (!this.isConnected) {
      throw new Error("資料庫尚未連線，請先調用 connect() 方法");
    }
    return this.DB;
  }

  /**
   * 檢查是否已連線
   */
  isDBConnected(): boolean {
    return this.isConnected;
  }

  /**
   * 獲取當前連線URL
   */
  getConnectionUrl(): string {
    return this.connectionUrl;
  }

  /**
   * 斷開資料庫連線
   */
  async disconnect(): Promise<void> {
    if (this.isConnected && this.DB) {
      await this.DB.disconnect();
      this.isConnected = false;
      console.log("[ConnectionManager] 已斷開資料庫連線");
    }
  }
}
