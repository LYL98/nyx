// pages/amap/amap.js

import { AmapFile } from './../../utils/index';
const KEY = '264ecc7cdad876ba3c0faadda33da445';

const amapFun = new AmapFile.AMapWX({ key: KEY });

const debounce = function (func, wait) {
  let timeout;

  return function () {
    let context = this;
    let args = arguments;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    locationAuth: true, // 是否具有地理位置授权

    loading: false,

    location: { lng: '', lat: '', province_title: '', city_title: '', poi: '' },

    // 搜索状态
    inputFocus: false,
    keywords: '',
    searchList: [],

    // 地图高度控制
    mapHeight: 500,

    // 中心点附近的poi列表
    pois: [],

    // 中心点具体地址
    centerPoi: {}
  },

  opensetting(e) {
    this.setData({
      locationAuth: e.detail.authSetting['scope.userLocation'],
    });
  },
  /**
   * 生命周期函数--监听页面加载
   * 页面加载时，判断是否传递进了location，并含有lng、lat，如果存在则使用该中心点初始化地图
   */
  onLoad: function (options) {
    let { location } = options;
    if (location) {
      
      location = JSON.parse(decodeURIComponent(location));

      this.setData({ location: location });
    }
  },

  onInputFocus() {
    this.setData({ inputFocus: true });
    // 注册防抖函数
    this.debounceInput = debounce(function (e) {
      const keywords = e.detail.value;
      if (keywords && keywords.length > 1) {
        this.setData({ keywords });
        this.getPois(keywords, 'search');
      }
    }, 300);
  },

  onInputKeywords(e) {
    this.debounceInput && this.debounceInput(e);
  },

  onInputClear() {
    this.setData({ keywords: '' });
  },

  onCancelSearch() {
    this.setData({ keywords: '', inputFocus: false, mapHeight: 500, searchList: [] });
  },

  upper(e) {
    if (this.data.mapHeight !== 500) {
      this.setData({ mapHeight: 500 });
    }
  },

  scroll(e) {
    if (e.detail.deltaY < -20) {
      // 下拉
      this.setData({ mapHeight: 300 });
    }
  },

  // 页面展示时，判断location中的 longitude 及 latitude是否存在？
  // 如果不存在，则获取省份 + 城市名称，查询pois，取第一个建筑物 作为中心点
  // 如果省份 和城市 都不存在，则获取当前地理位置，并初始化地图。
  // 在获取地理位置过程中，如果没有用户的授权，则提醒用户开启地理位置授权
  onShow() {

    let location = this.data.location;

    if (location && location.lng && location.lat) {
      this.initMap(location);
      return;
    }

    // 如果地理位置不存在，则直接读取当前用户所在位置

    // if (location && location.province_title && location.city_title) {
      
      
    //   this.getPois(location.province_title + location.city_title, 'init');
    //   this.mapCtx = wx.createMapContext('map');
    //   return;
    // }

    // 如果不存在省市 和 坐标，则加载用户自己的位置信息
    this.initLocation();
  },

  initLocation() {
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        location = { lng: res.longitude, lat: res.latitude };
        this.setData({
          location: Object.assign(this.data.location, location),
        });
        this.initMap(location);
      },
      fail: (info) => {
        if (info.errMsg.indexOf('getLocation') >= 0) {
          this.setData({
            locationAuth: false,
          });
        }
      },
    });
  },

  /**
   * 1、如果有地址，则按照 地址 + lngLat进行地图初始化
   * 2、如果没有地址，则请求本地信息，并初始化地图
   * 3、根据中心点信息，获取pois
   */

  initMap({ lng, lat }) {
    // 根据地图信息，获取输入提示
    amapFun.getRegeo({
      location: lng + ',' + lat,
      success: (data) => {
        let keywords = data[0].desc;
        let aois = data[0].regeocodeData.aois;
        this.setData({
          centerPoi: {
            desc: data[0].desc,
            lat: lat,
            lng: lng,
            name: data[0].name
          } 
        });
        if (Array.isArray(aois) && aois.length > 0) {
          keywords = aois[0].name;
        }

        this.getPois(keywords, 'regeo');
      },
      fail: function (info) {
        //失败回调
        console.error(info);
      },
    });
    this.mapCtx = wx.createMapContext('map');
  },

  getPois(keywords, type = 'search') {
    if (type !== 'init') {
      const { province_title, city_title } = this.data.location;
      if (keywords.indexOf(province_title) < 0) {
        keywords = province_title + keywords;
      }
    }

    this.setData({ loading: true });
    
    wx.request({
      url: 'https://restapi.amap.com/v3/place/text',
      header: {
        'content-type': 'application/json',
      },
      method: 'GET',
      data: {
        key: 'dab169a532b5a4a04c53ddc4ccb1b012',
        keywords: keywords,
        page: 1,
        offset: 30,
        extensions: 'all',
      },
      success: (res) => {
        let pois = res.data.pois || [];
        if (type === 'search') {
          pois.forEach((item) => {
            let strList = item.name.split(keywords);
            let length = strList.length;
            let highlightNodes = [];
            strList.forEach((str, index) => {
              highlightNodes.push(str);
              index !== length - 1 && highlightNodes.push(keywords);
            });
            item.highlightNodes = highlightNodes;
          });
          this.setData({ searchList: pois });
        } else if (type === 'init') {
          const lngLat = pois[0].location.split(',');
          this.setData({
            location: Object.assign(this.data.location, { lng: lngLat[0], lat: lngLat[1] }),
            pois: pois,
          });
        } else {
          this.setData({ pois: pois });
        }
      },
      fail: (err) => {},
      complete: () => {
        this.setData({ loading: false });
      },
    });
  },

  regionChange(e) {
    if (e.type == 'end' && e.causedBy == 'drag') {

      let that = this;

      this.mapCtx.getCenterLocation({
        success: (res) => {
          const lng = res.longitude;
          const lat = res.latitude;
          this.setData({
            location: Object.assign(that.data.location, { lng, lat }),
          });

          amapFun.getRegeo({
            location: lng + ',' + lat,
            success: (data) => {
              let keywords = data[0].desc;
              const aois = data[0].regeocodeData.aois;
              this.setData({
                centerPoi: {
                  desc: data[0].desc,
                  lat: lat,
                  lng: lng,
                  name: data[0].name
                } 
              });
              if (Array.isArray(aois) && aois.length > 0) {
                keywords = aois[0].name;
              }

              this.getPois(keywords, 'regeo');
            },
            fail: function (info) {
              //失败回调
              console.error(info);
            },
          });
        },
      });
    }
  },

  onSelectCenter(){
    const { centerPoi } = this.data;
    const pages = getCurrentPages();
    const prePage = pages[pages.length - 2];
    location = {
      lng: centerPoi.lng,
      lat: centerPoi.lat,
      poi: centerPoi.desc,
    };
    typeof prePage.selectGeoCallBack === 'function' && prePage.selectGeoCallBack(Object.assign(this.data.location, location));
    wx.navigateBack();
  },

  onSelectItem(e) {
    try {
      const { item } = e.target.dataset;
      
      const pages = getCurrentPages();
      const prePage = pages[pages.length - 2];
      const lngLat = item.location.split(',');
      location = {
        lng: Number(lngLat[0]),
        lat: Number(lngLat[1]),
        poi: item.name,
      };
      typeof prePage.selectGeoCallBack === 'function' && prePage.selectGeoCallBack(Object.assign(this.data.location, location));
      wx.navigateBack();
    } catch (err) {}
  },
});
