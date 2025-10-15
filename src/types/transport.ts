/**
 * 交通模块类型定义
 * @fileoverview 定义交通相关的所有 TypeScript 接口和类型
 */

/**
 * 交通工具类型枚举
 */
export enum TransportType {
  PLANE = 'plane',           // 飞机
  HIGH_SPEED_RAIL = 'high_speed_rail', // 高铁
  TRAIN = 'train',          // 火车
  SUBWAY = 'subway',        // 地铁
  BUS = 'bus',              // 公交
  TAXI = 'taxi',           // 打车
  RENTAL_CAR = 'rental_car', // 租车
  SELF_DRIVE = 'self_drive', // 自驾
  WALKING = 'walking',      // 步行
  BICYCLE = 'bicycle',      // 自行车
  MOTORCYCLE = 'motorcycle', // 摩托车
  BOAT = 'boat',           // 船只
  OTHER = 'other'           // 其他
}

/**
 * 交通费用类型
 */
export interface TransportCost {
  /** 基础费用 */
  baseCost: number
  /** 燃油费（自驾/租车） */
  fuelCost?: number
  /** 过路费（自驾/租车） */
  tollCost?: number
  /** 停车费 */
  parkingCost?: number
  /** 保险费 */
  insuranceCost?: number
  /** 其他费用 */
  otherCosts?: Array<{
    name: string
    amount: number
    description?: string
  }>
  /** 总费用 */
  totalCost: number
  /** 货币单位 */
  currency: string
}

/**
 * 交通路线段
 */
export interface TransportSegment {
  /** 唯一标识 */
  id: string
  /** 交通工具类型 */
  transportType: TransportType
  /** 出发地 */
  departure: {
    name: string
    address?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  /** 目的地 */
  arrival: {
    name: string
    address?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  /** 出发时间 */
  departureTime: Date
  /** 到达时间 */
  arrivalTime: Date
  /** 预计时长（分钟） */
  duration: number
  /** 距离（公里） */
  distance?: number
  /** 费用信息 */
  cost: TransportCost
  /** 备注信息 */
  notes?: string
  /** 预订信息 */
  booking?: {
    /** 预订号 */
    bookingNumber?: string
    /** 预订平台 */
    platform?: string
    /** 预订链接 */
    bookingUrl?: string
    /** 确认状态 */
    confirmed: boolean
  }
  /** 座位/舱位信息 */
  seatInfo?: {
    /** 座位号 */
    seatNumber?: string
    /** 舱位等级 */
    class?: string
    /** 车厢号 */
    carriageNumber?: string
  }
}

/**
 * 交通路线
 */
export interface TransportRoute {
  /** 唯一标识 */
  id: string
  /** 路线名称 */
  name: string
  /** 路线描述 */
  description?: string
  /** 路线段列表 */
  segments: TransportSegment[]
  /** 总费用 */
  totalCost: TransportCost
  /** 总时长（分钟） */
  totalDuration: number
  /** 总距离（公里） */
  totalDistance: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 是否收藏 */
  isFavorite: boolean
  /** 标签 */
  tags: string[]
}

/**
 * 交通预算
 */
export interface TransportBudget {
  /** 预算ID */
  id: string
  /** 预算名称 */
  name: string
  /** 总预算金额 */
  totalBudget: number
  /** 已使用金额 */
  usedAmount: number
  /** 剩余金额 */
  remainingAmount: number
  /** 货币单位 */
  currency: string
  /** 预算分类 */
  categories: Array<{
    type: TransportType
    budget: number
    used: number
  }>
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 地图相关配置
 */
export interface MapConfig {
  /** 地图中心点 */
  center: {
    lat: number
    lng: number
  }
  /** 缩放级别 */
  zoom: number
  /** 地图类型 */
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  /** 是否显示交通信息 */
  showTraffic: boolean
  /** 是否显示公交信息 */
  showTransit: boolean
}

/**
 * 交通提醒
 */
export interface TransportReminder {
  /** 提醒ID */
  id: string
  /** 关联的路线段ID */
  segmentId: string
  /** 提醒时间 */
  reminderTime: Date
  /** 提醒类型 */
  type: 'departure' | 'arrival' | 'check_in' | 'custom'
  /** 提醒内容 */
  message: string
  /** 是否已提醒 */
  isNotified: boolean
  /** 创建时间 */
  createdAt: Date
}

/**
 * 交通统计信息
 */
export interface TransportStats {
  /** 总路线数 */
  totalRoutes: number
  /** 总费用 */
  totalCost: number
  /** 最常用交通工具 */
  mostUsedTransport: TransportType
  /** 平均每公里费用 */
  averageCostPerKm: number
  /** 总里程 */
  totalDistance: number
  /** 总时长 */
  totalDuration: number
  /** 按交通工具分类的统计 */
  transportBreakdown: Array<{
    type: TransportType
    count: number
    totalCost: number
    totalDistance: number
  }>
}
