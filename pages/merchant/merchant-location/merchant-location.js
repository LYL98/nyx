const app = getApp();
import { Http, Config } from './../../../utils/index';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowCircum: false,
    isShowSetting: false,
    settingWarn: '地理位置',
    currentIndex: -1,
    location: { lng: 107.761962, lat: 33.529177 },
    scale: 1,
    showType: 'province', //显示类型 province、zone、city、store
    provinceData: [],
    zoneData: [],
    cityData: [],
    storeData: [],
    markers: [],
    query: {
      province_code: '', //791
      zone_id: '', //15
      city_id: '', //183
      condition: '',
      need_num: ''
    },
    dialog: {
      isShowProvinceDialog: false,
      isShowCityDialog: false,
      isShowZoneDialog: false
    },
    provinceList: [],
    zoneList: [],
    cityList: [],
    selectedProvince: { code: '', title: '全部区域' },
    selectedZone: { id: '', title: '全部片区' },
    selectedCity: { id: '', title: '全部县域' },
    isShowSearchResult: false,
    inputFocus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.signIsLogin(() => {
      this.getProvinceData();
      this.loadProvinceList();
    });
  },

  onShow(){
    this.setData({ isShowSetting: false });
  },

  loadProvinceList() {
    Http.get(Config.api.baseProvinceList, { is_no_prompt: true }).then((res) => {
      this.setData({ provinceList: [{code: '', title: '全部'}, ...res.data] });
    });
  },

  loadZoneList() {
    Http.get(Config.api.baseZoneList, { is_no_prompt: true, province_code: this.data.query.province_code }).then((res) => {
      this.setData({ zoneList: [{id: '', title: '全部'}, ...res.data] });
    });
  },

  loadCityList() {
    Http.get(Config.api.baseCityList, { is_no_prompt: true, zone_id: this.data.query.zone_id }).then((res) => {
      this.setData({ cityList: [{id: '', title: '全部'}, ...res.data] });
    });
  },

  //显示搜索结果
  showSearchResult(e){
    let isfocus = e.currentTarget.dataset.isfocus;
    this.setData({ isShowSearchResult: true, inputFocus: isfocus });
  },
  hideSearchResult(){
    this.setData({ isShowSearchResult: false });
  },
  clearQueryCondition(){
    this.setData({ 'query.condition': '' }, () => {
      this.getRelevantData();
    });
  },
  inputConfirm(e){
    let value = e.detail.value;
    this.setData({ 'query.condition': value }, () => {
      this.getRelevantData();
    });
  },

  openProvinceDialog() {
    this.setData({ 'dialog.isShowProvinceDialog': true });
  },

  closeProvinceDialog() {
    this.setData({ 'dialog.isShowProvinceDialog': false });
  },

  openZoneDialog() {
    if(!this.data.query.province_code) return;
    this.setData({ 'dialog.isShowZoneDialog': true });
  },

  closeZoneDialog() {
    this.setData({ 'dialog.isShowZoneDialog': false });
  },

  openCityDialog() {
    if(!this.data.query.zone_id) return;
    this.setData({ 'dialog.isShowCityDialog': true});
  },

  closeCityDialog() {
    this.setData({ 'dialog.isShowCityDialog': false });
  },

  changeQuery(event) {
    let { item, key, value } = event.target.dataset;
    let { query } = this.data;
    switch (key) {
      case 'province_code':
        query.province_code = value;
        query.zone_id = '';
        query.city_id = '';
        let provinceItem = value ? { code: item.code, title: item.title } : { code: '', title: '全部区域' };
        this.setData(
          {
            selectedProvince: provinceItem,
            selectedZone: { id: '', title: '全部片区' },
            selectedCity: { id: '', title: '全部县域' },
            query,
            'dialog.isShowProvinceDialog': false,
          }, () => {
            this.loadZoneList();
          }
        );
        break;
      case 'zone_id':
        query.zone_id = value;
        query.city_id = '';
        let zoneItem = value ? { id: item.id, title: item.title } : { id: '', title: '全部片区' };
        this.setData({
          selectedZone: zoneItem,
          selectedCity: { id: '', title: '全部县域' },
          query,
          'dialog.isShowZoneDialog': false,
        }, () => {
          this.loadCityList();
        });
        break;
      case 'city_id':
        query.city_id = value;
        let cityItem = value ? { id: item.id, title: item.title } : { id: '', title: '全部县域' };
        this.setData({
          selectedCity: cityItem,
          query,
          'dialog.isShowCityDialog': false,
        });
        break;
    }
    this.getRelevantData();
  },

  getRelevantData(){
    let { query } = this.data;
    //查询县域具体门店
    if(query.city_id || query.condition){
      this.getStoreData();
    }
    //查询县域加总
    else if(query.zone_id){
      this.getCityData();
    }
    //查询片区加总
    else if(query.province_code){
      this.getZoneData();
    }
    //查询区域加总
    else{
      this.getProvinceData();
    }
  },

  //点击标记
  makertap(e){
    let markerId = e.detail.markerId;
    let con = markerId.split('_');
    if(con.length >= 3){
      let type = con[0], id = con[1], title = con[2];
      let { query, selectedProvince, selectedZone, selectedCity, storeData } = this.data;
      if(type === 'province'){
        query.province_code = id;
        selectedProvince = { code: id, title };
        this.setData({query, selectedProvince}, ()=>{
          this.getZoneData();
          this.loadZoneList();
        });
      }else if(type === 'zone'){
        query.zone_id = Number(id);
        selectedZone = { id: Number(id), title };
        this.setData({query, selectedZone}, ()=>{
          this.getCityData();
          this.loadCityList();
        });
      }else if(type === 'city'){
        query.city_id = Number(id);
        selectedCity = { id: Number(id), title };
        this.setData({query, selectedCity}, ()=>{
          this.getStoreData();
        });
      }else{
        let index = 0;
        storeData.forEach((item, i) => {
          if(item.id === Number(id)){
            index = i;
          }
        });
        this.setData({
          currentIndex: this.data.currentIndex === index ? -1 : index
        }, () => {
          this.changeCurrentIndex();
        });
      }
      
    }
  },

  //点击列表
  clickSearchItem(e) {
    let index = e.currentTarget.dataset.index;
    let data = this.data.storeData[index];
    if(!data.geo || !data.geo.lng || !data.geo.lat){
      wx.showToast({ title: '无定位', icon: 'none' });
      return;
    }
    this.setData({ currentIndex: index, isShowSearchResult: false, location: {lng: data.geo.lng, lat: data.geo.lat} }, () => {
      this.changeCurrentIndex();
    });
  },

  //点击地图
  maptap(){
    this.setData({ currentIndex: -1 }, () => {
      this.changeCurrentIndex();
    });
  },

  changeCurrentIndex() {
    let { currentIndex } = this.data;
    let { markers, storeData } = this.data;
    for(let i = 0; i < markers.length; i++){
      let markerId = markers[i].id;
      let con = markerId.split('_');
      if(con.length >= 3 && con[0] === 'store'){
        let id = Number(con[1]);
        if(currentIndex >= 0 && storeData[currentIndex].id === id){
          markers[i].callout.bgColor = '#FF9941';
          markers[i].iconPath = './../../../assets/img/marker2.png';
          markers[i].zIndex = 100;
        }else{
          markers[i].callout.bgColor = '#00ADE7';
          markers[i].iconPath = './../../../assets/img/marker.png';
          markers[i].zIndex = 99;
        }
      }
    }
    this.setData({ markers });
  },

  //获取区域加总
  getProvinceData(){
    let that = this;
    let markers = [];
    wx.showNavigationBarLoading();
    Http.get(Config.api.storeByProvince, {}).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
      rd.forEach(v => {
        if(v.center_geo && v.center_geo.lat && v.center_geo.lng){
          markers.push({
            id: `province_${v.code}_${v.title}`,
            callout: {
              content: ` ${v.title}(${v.store_num}家) `,
              color: '#FFF',
              bgColor: '#00ADE7',
              borderRadius: 5,
              display: 'ALWAYS',
              fontSize: 16,
              padding: 6,
              anchorY: 10
            },
            latitude: v.center_geo.lat,
            longitude: v.center_geo.lng,
            iconPath: './../../../assets/img/location.png',
            width: 10,
            height: 30
          });
        }
      });
      that.setData({ provinceData: rd, showType: 'province', markers, storeData: [] });
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
  //获取片区加总
  getZoneData(){
    let that = this;
    let markers = [];
    let { query } = that.data;
    wx.showNavigationBarLoading();
    Http.get(Config.api.storeByZone, {
      province_code: query.province_code
    }).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
      rd.forEach(v => {
        if(v.center_geo && v.center_geo.lat && v.center_geo.lng){
          markers.push({
            id: `zone_${v.id}_${v.title}`,
            width: 100,
            height: 100,
            callout: {
              content: ` ${v.title}(${v.store_num}家) `,
              color: '#FFF',
              bgColor: '#00ADE7',
              display: 'ALWAYS',
              borderRadius: 5,
              fontSize: 16,
              padding: 6,
              anchorY: 10
            },
            latitude: v.center_geo.lat,
            longitude: v.center_geo.lng,
            iconPath: './../../../assets/img/location.png',
            width: 10,
            height: 30
          });
        }
      });
      that.setData({ zoneData: rd, showType: 'zone', markers, storeData: [] });
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
  //获取县域加总
  getCityData(){
    let that = this;
    let markers = [];
    let { query } = that.data;
    wx.showNavigationBarLoading();
    Http.get(Config.api.storeByCity, {
      province_code: query.province_code,
      zone_id: query.zone_id
    }).then(res => {
      wx.hideNavigationBarLoading();
      let rd = res.data;
      rd.forEach(v => {
        if(v.center_geo && v.center_geo.lat && v.center_geo.lng){
          markers.push({
            id: `city_${v.id}_${v.title}`,
            callout: {
              content: ` ${v.title}(${v.store_num}家) `,
              color: '#FFF',
              bgColor: '#00ADE7',
              display: 'ALWAYS',
              borderRadius: 5,
              fontSize: 16,
              padding: 6,
              anchorY: 10
            },
            latitude: v.center_geo.lat,
            longitude: v.center_geo.lng,
            iconPath: './../../../assets/img/location.png',
            width: 10,
            height: 30
          });
        }
      });
      that.setData({ cityData: rd, showType: 'city', markers, storeData: [] });
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
  //获取门店列表
  getStoreData() {
    let that = this;
    let { query } = that.data;
    wx.showNavigationBarLoading();
    Http.get(Config.api.storeLocationDetail, {
      ...query,
      need_num: query.condition ? 10 : ''
    }).then(res => {
      wx.hideNavigationBarLoading();
      that.handleMark(res.data);
    }).catch(error => {
      wx.hideNavigationBarLoading();
    });
  },
  openLocation(e){
    let item = e.currentTarget.dataset.item;
    wx.openLocation({//​使用微信内置地图查看位置。
      latitude: item.geo.lat,//要去的纬度-地址
      longitude: item.geo.lng,//要去的经度-地址
      name: item.title,
      address: item.address
    });
  },

  getLocation(){
    let that = this;
    wx.showLoading({
      title: '请稍等...',
      mask: true,
      success(){
        that.setData({isShowCircum: true, 'query.condition': ''});
        wx.getLocation({
          type: 'wgs84',
          success(res) {
            that.getStoreDataByLatLng(res.longitude, res.latitude);
          },
          fail() {
            wx.hideLoading();
            app.judgeSetting('scope.userLocation', (res)=>{
              if(res){
                wx.showModal({
                  title: '提示',
                  content: '获取地址失败',
                  confirmText: "我知道了",
                  confirmColor: "#00ADE7",
                  showCancel: false
                });
              }else{
                that.setData({
                  isShowSetting: true,
                  settingWarn: '地理位置'
                });
              }
            });
          }
        });
      }
    });
  },

  //获取门店列表(通过经纬度)
  getStoreDataByLatLng(lng, lat) {
    let that = this;
    Http.get(Config.api.storeFiveMiles, {
      lng: lng,
      lat: lat
    }).then(res => {
      wx.hideLoading();
      that.handleMark(res.data, {lng: lng, lat: lat});
    }).catch(error => {
      wx.hideLoading();
    });
  },

  hideCircum(){
    this.setData({
      isShowCircum: false,
      storeData: [],
      currentIndex: -1
    }, () => {
      this.getRelevantData();
    });
  },

  //渲染点
  handleMark(storeData, location){
    let markers = [];
    let index = 0;
    storeData.forEach(v => {
      if(v.geo && v.geo.lat && v.geo.lng){
        if(index === 0 && !location){
          location = { lat: v.geo.lat, lng: v.geo.lng };
          index++;
        }
        markers.push({
          id: `store_${v.id}_${v.title}`,
          zIndex: index === 1 ? 100 : 99,
          callout: {
            fontSize: 10,
            content: ` ${v.title} `,
            color: '#FFF',
            bgColor: '#00ADE7',
            borderRadius: 3,
            display: 'ALWAYS',
            padding: 3
          },
          latitude: v.geo.lat,
          longitude: v.geo.lng,
          iconPath: './../../../assets/img/marker.png',
          width: 32,
          height: 32
        });
      }
    });
    this.setData({ storeData, showType: 'store', markers, scale: 14, location, currentIndex: -1 });
  },

});
