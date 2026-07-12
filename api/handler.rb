# frozen_string_literal: true

# 八字排盘引擎 · 从真版 — Ruby 后端
# 挂载于 /api/ext/bazi-paipan/

class BaziPaipanExt < Clacky::ApiExtension
  # ========== 常量 ==========
  TG  = %w[甲 乙 丙 丁 戊 己 庚 辛 壬 癸].freeze
  DZ  = %w[子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥].freeze
  WX  = {
    '甲'=>'木','乙'=>'木','丙'=>'火','丁'=>'火','戊'=>'土','己'=>'土',
    '庚'=>'金','辛'=>'金','壬'=>'水','癸'=>'水','子'=>'水','丑'=>'土',
    '寅'=>'木','卯'=>'木','辰'=>'土','巳'=>'火','午'=>'火','未'=>'土',
    '申'=>'金','酉'=>'金','戌'=>'土','亥'=>'水'
  }.freeze

  NAYIN = {
    '甲子'=>'海中金','乙丑'=>'海中金','丙寅'=>'炉中火','丁卯'=>'炉中火',
    '戊辰'=>'大林木','己巳'=>'大林木','庚午'=>'路旁土','辛未'=>'路旁土',
    '壬申'=>'剑锋金','癸酉'=>'剑锋金','甲戌'=>'山头火','乙亥'=>'山头火',
    '丙子'=>'涧下水','丁丑'=>'涧下水','戊寅'=>'城头土','己卯'=>'城头土',
    '庚辰'=>'白蜡金','辛巳'=>'白蜡金','壬午'=>'杨柳木','癸未'=>'杨柳木',
    '甲申'=>'泉中水','乙酉'=>'泉中水','丙戌'=>'屋上土','丁亥'=>'屋上土',
    '戊子'=>'霹雳火','己丑'=>'霹雳火','庚寅'=>'松柏木','辛卯'=>'松柏木',
    '壬辰'=>'长流水','癸巳'=>'长流水','甲午'=>'沙中金','乙未'=>'沙中金',
    '丙申'=>'山下火','丁酉'=>'山下火','戊戌'=>'平地木','己亥'=>'平地木',
    '庚子'=>'壁上土','辛丑'=>'壁上土','壬寅'=>'金箔金','癸卯'=>'金箔金',
    '甲辰'=>'覆灯火','乙巳'=>'覆灯火','丙午'=>'天河水','丁未'=>'天河水',
    '戊申'=>'大驿土','己酉'=>'大驿土','庚戌'=>'钗钏金','辛亥'=>'钗钏金',
    '壬子'=>'桑柘木','癸丑'=>'桑柘木','甲寅'=>'大溪水','乙卯'=>'大溪水',
    '丙辰'=>'沙中土','丁巳'=>'沙中土','戊午'=>'天上火','己未'=>'天上火',
    '庚申'=>'石榴木','辛酉'=>'石榴木','壬戌'=>'大海水','癸亥'=>'大海水'
  }.freeze

  CANG_GAN = {
    '子'=>%w[癸],       '丑'=>%w[己 癸 辛], '寅'=>%w[甲 丙 戊],
    '卯'=>%w[乙],       '辰'=>%w[戊 乙 癸], '巳'=>%w[丙 庚 戊],
    '午'=>%w[丁 己],    '未'=>%w[己 丁 乙], '申'=>%w[庚 壬 戊],
    '酉'=>%w[辛],       '戌'=>%w[戊 辛 丁], '亥'=>%w[壬 甲]
  }.freeze

  # 双胞胎后出者 日/时/命/身 支主气（中余气；独气支取劫气）
  ZHI_TWIN_MAIN = {
    '子'=>'壬','丑'=>'癸','寅'=>'丙','卯'=>'甲','辰'=>'乙','巳'=>'庚',
    '午'=>'己','未'=>'丁','申'=>'壬','酉'=>'庚','戌'=>'辛','亥'=>'甲'
  }.freeze

  # 双胞胎后出者 日/时/命/身 支藏干
  ZHI_TWIN_CANG = {
    '子'=>%w[壬], '丑'=>%w[癸 辛], '寅'=>%w[丙 戊], '卯'=>%w[甲],
    '辰'=>%w[乙 癸], '巳'=>%w[庚 戊], '午'=>%w[己], '未'=>%w[丁 乙],
    '申'=>%w[壬 戊], '酉'=>%w[庚], '戌'=>%w[辛 丁], '亥'=>%w[甲]
  }.freeze

  # 空亡（日柱旬）
  KONG_WANG = {
    '甲子'=>'戌亥','乙丑'=>'戌亥','丙寅'=>'戌亥','丁卯'=>'戌亥','戊辰'=>'戌亥',
    '己巳'=>'戌亥','庚午'=>'戌亥','辛未'=>'戌亥','壬申'=>'戌亥','癸酉'=>'戌亥',
    '甲戌'=>'申酉','乙亥'=>'申酉','丙子'=>'申酉','丁丑'=>'申酉','戊寅'=>'申酉',
    '己卯'=>'申酉','庚辰'=>'申酉','辛巳'=>'申酉','壬午'=>'申酉','癸未'=>'申酉',
    '甲申'=>'午未','乙酉'=>'午未','丙戌'=>'午未','丁亥'=>'午未','戊子'=>'午未',
    '己丑'=>'午未','庚寅'=>'午未','辛卯'=>'午未','壬辰'=>'午未','癸巳'=>'午未',
    '甲午'=>'辰巳','乙未'=>'辰巳','丙申'=>'辰巳','丁酉'=>'辰巳','戊戌'=>'辰巳',
    '己亥'=>'辰巳','庚子'=>'辰巳','辛丑'=>'辰巳','壬寅'=>'辰巳','癸卯'=>'辰巳',
    '甲辰'=>'寅卯','乙巳'=>'寅卯','丙午'=>'寅卯','丁未'=>'寅卯','戊申'=>'寅卯',
    '己酉'=>'寅卯','庚戌'=>'寅卯','辛亥'=>'寅卯','壬子'=>'寅卯','癸丑'=>'寅卯',
    '甲寅'=>'子丑','乙卯'=>'子丑','丙辰'=>'子丑','丁巳'=>'子丑','戊午'=>'子丑',
    '己未'=>'子丑','庚申'=>'子丑','辛酉'=>'子丑','壬戌'=>'子丑','癸亥'=>'子丑'
  }.freeze

  # 十二长生表（阳干）
  CS12_MAP = {
    '甲'=>%w[亥 子 丑 寅 卯 辰 巳 午 未 申 酉 戌],
    '乙'=>%w[午 巳 辰 卯 寅 丑 子 亥 戌 酉 申 未],
    '丙'=>%w[寅 卯 辰 巳 午 未 申 酉 戌 亥 子 丑],
    '丁'=>%w[酉 申 未 午 巳 辰 卯 寅 丑 子 亥 戌],
    '戊'=>%w[寅 卯 辰 巳 午 未 申 酉 戌 亥 子 丑],
    '己'=>%w[酉 申 未 午 巳 辰 卯 寅 丑 子 亥 戌],
    '庚'=>%w[巳 午 未 申 酉 戌 亥 子 丑 寅 卯 辰],
    '辛'=>%w[子 亥 戌 酉 申 未 午 巳 辰 卯 寅 丑],
    '壬'=>%w[申 酉 戌 亥 子 丑 寅 卯 辰 巳 午 未],
    '癸'=>%w[卯 寅 丑 子 亥 戌 酉 申 未 午 巳 辰]
  }.freeze
  CS12_N = %w[长生 沐浴 冠带 临官 帝旺 衰 病 死 墓 绝 胎 养].freeze

  WU_HU_DUN = {'甲'=>'丙','己'=>'丙','乙'=>'戊','庚'=>'戊','丙'=>'庚','辛'=>'庚','丁'=>'壬','壬'=>'壬','戊'=>'甲','癸'=>'甲'}.freeze
  WU_SHU_DUN = {'甲'=>'甲','己'=>'甲','乙'=>'丙','庚'=>'丙','丙'=>'戊','辛'=>'戊','丁'=>'庚','壬'=>'庚','戊'=>'壬','癸'=>'壬'}.freeze

  MONTH_TERM = [2,4,6,8,10,12,14,16,18,20,22,0].freeze # 寅月=立春(2)...丑月=小寒(0)
  S_TERM_NAME = %w[小寒 大寒 立春 雨水 惊蛰 春分 清明 谷雨 立夏 小满 芒种 夏至 小暑 大暑 立秋 处暑 白露 秋分 寒露 霜降 立冬 小雪 大雪 冬至].freeze

  YANG_GAN = %w[甲 丙 戊 庚 壬].freeze

  SHENG_XIAO = %w[鼠 牛 虎 兔 龙 蛇 马 羊 猴 鸡 狗 猪].freeze

  # 神煞表
  TIANYI_MAP = {'甲'=>'丑未','戊'=>'丑未','庚'=>'丑未','乙'=>'子申','己'=>'子申','丙'=>'亥酉','丁'=>'亥酉','辛'=>'午寅','壬'=>'巳卯','癸'=>'巳卯'}.freeze
  WENCHANG_MAP = {'甲'=>'巳','乙'=>'午','丙'=>'申','丁'=>'酉','戊'=>'申','己'=>'酉','庚'=>'亥','辛'=>'子','壬'=>'寅','癸'=>'卯'}.freeze
  LU_MAP = {'甲'=>'寅','乙'=>'卯','丙'=>'巳','丁'=>'午','戊'=>'巳','己'=>'午','庚'=>'申','辛'=>'酉','壬'=>'亥','癸'=>'子'}.freeze
  YIMA_MAP = {'寅午戌'=>'申','巳酉丑'=>'亥','申子辰'=>'寅','亥卯未'=>'巳'}.freeze
  TAOHUA_MAP = {'寅午戌'=>'卯','巳酉丑'=>'午','申子辰'=>'酉','亥卯未'=>'子'}.freeze
  HUAGAI_MAP = {'寅午戌'=>'戌','巳酉丑'=>'丑','申子辰'=>'辰','亥卯未'=>'未'}.freeze
  GUOYIN_MAP = {'甲'=>'未','乙'=>'申','丙'=>'酉','丁'=>'戌','戊'=>'亥','己'=>'子','庚'=>'丑','辛'=>'寅','壬'=>'卯','癸'=>'辰'}.freeze

  D2R = Math::PI / 180
  J2000 = 2451545.0

  # ========== 天文算法：太阳视黄经 & 节气 ==========
  def self.sun_lng(jd)
    t = (jd - J2000) / 36525.0
    m = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t
    l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t * t
    c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m * D2R) +
        (0.019993 - 0.000101 * t) * Math.sin(2 * m * D2R) +
        0.000289 * Math.sin(3 * m * D2R)
    omega = 125.04 - 1934.136 * t
    l = l0 + c - 0.00569 - 0.00478 * Math.sin(omega * D2R)
    l % 360
  end

  def self.jd2utc_ms(jd)
    ((jd - 2440587.5) * 86400000).to_i
  end

  def self.utc2jd(ms)
    ms / 86400000.0 + 2440587.5
  end

  # 获取指定年份第 n 个节气（n: 0=小寒...23=冬至）的北京时间 (Time)
  def self.get_solar_term(y, n)
    target_deg = (n * 15 + 285) % 360
    base_ms = Time.utc(1900, 1, 6, 2, 5, 0).to_i * 1000
    trop_ms = 31556925974.7
    est_utc_ms = base_ms + (trop_ms * (y - 1900)).to_i + [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758][n] * 60000
    est_jd = utc2jd(est_utc_ms)

    lo = est_jd - 1
    hi = est_jd + 1
    lng_lo = sun_lng(lo)
    lng_hi = sun_lng(hi)
    lng_hi += 360 if lng_hi < lng_lo
    adj_target = target_deg
    adj_target += 360 if adj_target < lng_lo
    adj_target -= 360 if adj_target > lng_hi

    32.times do
      mid = (lo + hi) / 2.0
      lng_mid = sun_lng(mid)
      lng_mid += 360 if lng_mid < lng_lo
      if lng_mid < adj_target
        lo = mid
        lng_lo = lng_mid
      else
        hi = mid
      end
      break if hi - lo < 1e-9
    end

    jd_final = (lo + hi) / 2.0
    Time.at((jd_final - 2440587.5) * 86400 + 8 * 3600).utc
  end

  # ========== 真太阳时 ==========
  def self.days_in(y, m)
    return 31 if [1,3,5,7,8,10,12].include?(m)
    return 30 if [4,6,9,11].include?(m)
    (y % 4 == 0 && y % 100 != 0) || y % 400 == 0 ? 29 : 28
  end

  def self.day_of_year(y, m, d)
    days_in_month = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    days_in_month[2] = 29 if (y % 4 == 0 && y % 100 != 0) || y % 400 == 0
    doy = d
    (1...m).each { |i| doy += days_in_month[i] }
    doy
  end

  def self.equation_of_time(y, m, d)
    doy = day_of_year(y, m, d)
    b = (doy - 1) * 2 * Math::PI / 365.0
    229.18 * (0.000075 + 0.001868 * Math.cos(b) - 0.032077 * Math.sin(b) -
              0.014615 * Math.cos(2*b) - 0.040849 * Math.sin(2*b))
  end

  def self.true_solar_time(y, m, d, h, mi, lng)
    lng_offset = (lng - 120) * 4
    eot = equation_of_time(y, m, d)
    offset_min = lng_offset + eot
    total_min = h * 60 + mi + offset_min

    adj_min = total_min
    adj_d = d; adj_m = m; adj_y = y

    while adj_min < 0
      adj_min += 1440
      adj_d -= 1
    end
    while adj_min >= 1440
      adj_min -= 1440
      adj_d += 1
    end

    days_in_month = days_in(adj_y, adj_m)
    if adj_d < 1
      adj_m -= 1
      if adj_m < 1
        adj_m = 12
        adj_y -= 1
      end
      adj_d = days_in(adj_y, adj_m)
    elsif adj_d > days_in_month
      adj_d -= days_in_month
      adj_m += 1
      if adj_m > 12
        adj_m = 1
        adj_y += 1
      end
    end

    adj_h = (adj_min / 60).floor
    adj_mi = (adj_min % 60).round

    { y: adj_y, m: adj_m, d: adj_d, h: adj_h, mi: adj_mi, offset_min: offset_min.round }
  end

  # ========== 年柱 ==========
  def self.year_pillar(y)
    idx = (y - 4) % 60
    idx += 60 if idx < 0
    { gan: TG[idx % 10], zhi: DZ[idx % 12], idx: idx }
  end

  # ========== 月柱 ==========
  def self.month_pillar(y, m, d, h, mi, year_gan)
    birth = Time.new(y, m, d, h || 0, mi || 0)
    12.times do |i|
      term_idx = MONTH_TERM[i]
      st_y = (term_idx == 0 && i == 11) ? y + 1 : y
      st = get_solar_term(st_y, term_idx)
      st_date = Time.new(st.year, st.month, st.day)

      next_i = (i + 1) % 12
      next_term = MONTH_TERM[next_i]
      next_y = next_term <= term_idx ? y + 1 : y
      next_st = get_solar_term(next_y, next_term)
      next_date = Time.new(next_st.year, next_st.month, next_st.day)

      if birth >= st_date && birth < next_date
        zhi = DZ[(i + 2) % 12]
        gan_start = WU_HU_DUN[year_gan]
        gan = TG[(TG.index(gan_start) + i) % 10]
        return { gan: gan, zhi: zhi, month_idx: i }
      end
    end
    # fallback 丑月
    zhi = '丑'
    gan_start = WU_HU_DUN[year_gan]
    { gan: TG[(TG.index(gan_start) + 11) % 10], zhi: zhi, month_idx: 11 }
  end

  # ========== 日柱 ==========
  def self.day_pillar(y, m, d)
    birth = Time.utc(y, m, d)
    ref = Time.utc(1900, 1, 1)
    diff_days = ((birth - ref) / 86400).round
    idx = (diff_days % 60 + 10) % 60
    pos = idx.negative? ? idx + 60 : idx
    { gan: TG[pos % 10], zhi: DZ[pos % 12], idx: pos }
  end

  # ========== 时柱 ==========
  def self.hour_pillar(day_gan, hour)
    zhi_idx = ((hour + 1) / 2) % 12
    zhi = DZ[zhi_idx]
    gan_start = WU_SHU_DUN[day_gan]
    gan = TG[(TG.index(gan_start) + zhi_idx) % 10]
    { gan: gan, zhi: zhi }
  end

  # ========== 十神 ==========
  SHI_SHEN_SHORT = {
    '比肩'=>'比','劫财'=>'劫','食神'=>'食','伤官'=>'伤',
    '偏印'=>'枭','正印'=>'印','偏财'=>'才','正财'=>'财',
    '七杀'=>'杀','正官'=>'官'
  }

  def self.shi_shen(ri_gan, gan, short: true)
    r = if ri_gan == gan
      '比肩'
    else
      dw = WX[ri_gan]; tw = WX[gan]
      if !dw || !tw
        '?'
      elsif dw == tw
        yin_yang_same = YANG_GAN.include?(ri_gan) == YANG_GAN.include?(gan)
        yin_yang_same ? '比肩' : '劫财'
      else
        yin_yang_same = YANG_GAN.include?(ri_gan) == YANG_GAN.include?(gan)
        sheng = {'木'=>'火','火'=>'土','土'=>'金','金'=>'水','水'=>'木'}
        ke    = {'木'=>'土','土'=>'水','水'=>'火','火'=>'金','金'=>'木'}
        if sheng[dw] == tw
          yin_yang_same ? '食神' : '伤官'
        elsif sheng[tw] == dw
          yin_yang_same ? '偏印' : '正印'
        elsif ke[dw] == tw
          yin_yang_same ? '偏财' : '正财'
        elsif ke[tw] == dw
          yin_yang_same ? '七杀' : '正官'
        else
          '?'
        end
      end
    end
    short ? (SHI_SHEN_SHORT[r] || r) : r
  end

  ZHI_MAIN = {'子'=>'癸','丑'=>'己','寅'=>'甲','卯'=>'乙','辰'=>'戊','巳'=>'丙','午'=>'丁','未'=>'己','申'=>'庚','酉'=>'辛','戌'=>'戊','亥'=>'壬'}.freeze

  TWIN_PILLARS = %i[ri shi ming shen].freeze

  def self.zhi_shi_shen(ri_gan, zhi, twin: 1, pillar_type: nil)
    main_gan = if twin == 2 && TWIN_PILLARS.include?(pillar_type)
      ZHI_TWIN_MAIN[zhi] || (ZHI_TWIN_CANG[zhi] ? ZHI_TWIN_CANG[zhi][0] : nil)
    else
      ZHI_MAIN[zhi]
    end
    return '?' unless main_gan
    shi_shen(ri_gan, main_gan)
  end

  # ========== 十二长生 ==========
  def self.chang_sheng(gan, zhi)
    map = CS12_MAP[gan] || CS12_MAP[case WX[gan]
      when '金' then '庚'; when '水' then '壬'; when '木' then '甲'
      when '火' then '丙'; when '土' then '戊'; else gan
    end]
    return '?' unless map
    i = map.index(zhi)
    i ? CS12_N[i] : '?'
  end

  # ========== 胎元 ==========
  def self.tai_yuan(yue_gan, yue_zhi)
    g_idx = (TG.index(yue_gan) + 1) % 10
    z_idx = (DZ.index(yue_zhi) + 3) % 12
    { gan: TG[g_idx], zhi: DZ[z_idx] }
  end

  # 地支序号：寅=1...丑=12
  def self.dz_num(zhi)
    ((DZ.index(zhi) + 10) % 12) + 1
  end

  def self.num_zhi(n)
    DZ[(n + 1) % 12]
  end

  # ========== 命宫 ==========
  def self.ming_gong(yue_zhi, shi_zhi, nian_gan)
    n = 14 - dz_num(yue_zhi) - dz_num(shi_zhi)
    n += 12 while n <= 0
    n -= 12 while n > 12
    zhi = num_zhi(n)
    ms = WU_HU_DUN[nian_gan]
    gan = TG[(TG.index(ms) + (n - 1)) % 10]
    { gan: gan, zhi: zhi }
  end

  # ========== 身宫 ==========
  def self.shen_gong(yue_zhi, shi_zhi, nian_gan)
    # 身宫 = (月序数 + 时辰序数) % 12  (0→12)
    month_num = dz_num(yue_zhi)
    hour_num = DZ.index(shi_zhi) + 1
    n = (month_num + hour_num) % 12
    n = 12 if n == 0
    zhi = num_zhi(n)
    ms = WU_HU_DUN[nian_gan]
    gan = TG[(TG.index(ms) + (n - 1)) % 10]
    { gan: gan, zhi: zhi }
  end

  # ========== 神煞 ==========
  def self.shen_sha(ri_gan, ri_zhi, nian_zhi, yue_zhi)
    a = []
    ty = TIANYI_MAP[ri_gan]
    a << '天乙贵' if ty && (ty.include?(ri_zhi) || ty.include?(nian_zhi) || ty.include?(yue_zhi))
    a << '文昌' if WENCHANG_MAP[ri_gan] == ri_zhi
    a << '禄神' if LU_MAP[ri_gan] == ri_zhi

    YIMA_MAP.each { |k, v| a << '驿马' if k.include?(nian_zhi) && v == ri_zhi }
    TAOHUA_MAP.each { |k, v| a << '桃花' if k.include?(ri_zhi) && v == ri_zhi }
    HUAGAI_MAP.each { |k, v| a << '华盖' if k.include?(ri_zhi) && v == ri_zhi }
    a << '国印贵' if GUOYIN_MAP[ri_gan] == ri_zhi

    a.empty? ? '—' : a.first(3).join('、')
  end

  # ========== 起运 & 大运 ==========
  def self.qi_yun_days(y, m, d, h, mi, yue_zhi, shun)
    birth = Time.new(y, m, d, h || 0, mi || 0)
    month_idx = ((DZ.index(yue_zhi) + 10) % 12)
    term_idx = MONTH_TERM[month_idx]

    if shun
      next_i = (month_idx + 1) % 12
      next_term = MONTH_TERM[next_i]
      next_y = next_term <= term_idx ? y + 1 : y
      st = get_solar_term(next_y, next_term)
      (st - birth) / 86400.0
    else
      st = get_solar_term(y, term_idx)
      (birth - st) / 86400.0
    end
  end

  def self.compute_da_yun(gender, nian_gan, yue_gan, yue_zhi, y, m, d, h, mi)
    yang = YANG_GAN.include?(nian_gan)
    male = gender == '男'
    shun = (male && yang) || (!male && !yang)

    days = qi_yun_days(y, m, d, h, mi, yue_zhi, shun)
    total_months = days / 3.0 * 12
    qy_years  = (total_months / 12).floor
    qy_months = (total_months % 12).floor
    qy_days   = ((total_months - total_months.floor) * 30).round

    yg_idx = TG.index(yue_gan)
    yz_idx = DZ.index(yue_zhi)

    da_yun = []
    10.times do |i|
      off = shun ? i + 1 : -(i + 1)
      g_idx = (yg_idx + off) % 10
      z_idx = (yz_idx + off) % 12
      g_idx += 10 if g_idx < 0
      z_idx += 12 if z_idx < 0
      start_age = qy_years + i * 10
      start_year = y + start_age
      da_yun << { gan: TG[g_idx], zhi: DZ[z_idx], start_age: start_age, start_year: start_year }
    end

    { da_yun: da_yun, qi_yun: { years: qy_years, months: qy_months, days: qy_days }, shun: shun }
  end

  # ========== 流年 ==========
  def self.liu_nian_jz(y)
    idx = (y - 4) % 60
    TG[idx % 10] + DZ[idx % 12]
  end

  # ========== 人元司令 ==========
  REN_YUAN = {
    '寅'=>[[7,'戊'],[14,'丙'],[30,'甲']],
    '卯'=>[[10,'甲'],[30,'乙']],
    '辰'=>[[9,'乙'],[12,'癸'],[30,'戊']],
    '巳'=>[[5,'戊'],[14,'庚'],[30,'丙']],
    '午'=>[[10,'丙'],[19,'己'],[30,'丁']],
    '未'=>[[9,'丁'],[12,'乙'],[30,'己']],
    '申'=>[[7,'戊'],[14,'壬'],[30,'庚']],
    '酉'=>[[10,'庚'],[30,'辛']],
    '戌'=>[[9,'辛'],[12,'丁'],[30,'戊']],
    '亥'=>[[7,'戊'],[12,'甲'],[30,'壬']],
    '子'=>[[10,'壬'],[30,'癸']],
    '丑'=>[[9,'癸'],[12,'辛'],[30,'己']]
  }.freeze

  def self.ren_yuan_si_ling(y, m, d)
    birth = Time.new(y, m, d)
    12.times do |mi|
      term_idx = MONTH_TERM[mi]
      st_y = (term_idx == 0 && mi == 11) ? y + 1 : y
      st = get_solar_term(st_y, term_idx)
      st_date = Time.new(st.year, st.month, st.day)

      next_mi = (mi + 1) % 12
      next_term = MONTH_TERM[next_mi]
      next_y = next_term <= term_idx ? y + 1 : y
      next_st = get_solar_term(next_y, next_term)
      next_date = Time.new(next_st.year, next_st.month, next_st.day)

      if birth >= st_date && birth < next_date
        days_after = ((birth - st_date) / 86400).floor + 1
        month_zhi = DZ[(mi + 2) % 12]
        ry = REN_YUAN[month_zhi]
        return nil unless ry
        ry.each do |max_day, gan|
          return { gan: gan, month_zhi: month_zhi, days_after: days_after } if days_after <= max_day
        end
        last = ry.last
        return { gan: last[1], month_zhi: month_zhi, days_after: days_after }
      end
    end
    nil
  end

  # ========== 主排盘函数 ==========
  def self.paipan(params)
    name   = params[:name]   || '未命名'
    gender = params[:gender] || '男'
    y      = params[:year].to_i
    m      = params[:month].to_i
    d      = params[:day].to_i
    h      = params[:hour].to_i
    mi     = params[:min].to_i
    lng    = params[:lng]&.to_f

    # 真太阳时修正
    tst = nil
    if lng
      tst = true_solar_time(y, m, d, h, mi, lng)
      y, m, d, h, mi = tst[:y], tst[:m], tst[:d], tst[:h], tst[:mi]
    end

    # 年柱（立春分界）
    lc = get_solar_term(y, 2) # 立春
    lc_date = Time.new(lc.year, lc.month, lc.day)
    birth = Time.new(y, m, d, h, mi)
    eff_year = birth < lc_date ? y - 1 : y
    nian = year_pillar(eff_year)

    # 月柱
    yue = month_pillar(y, m, d, h, mi, nian[:gan])

    # 日柱
    ri = day_pillar(y, m, d)

    # 时柱
    shi = hour_pillar(ri[:gan], h)

    # 胎元
    tai = tai_yuan(yue[:gan], yue[:zhi])

    # 命宫
    ming = ming_gong(yue[:zhi], shi[:zhi], nian[:gan])

    # 身宫
    shen = shen_gong(yue[:zhi], shi[:zhi], nian[:gan])

    # 大运
    dy_result = compute_da_yun(gender, nian[:gan], yue[:gan], yue[:zhi], y, m, d, h, mi)

    # 人元司令
    ry = ren_yuan_si_ling(y, m, d)

    # 生肖
    sx = SHENG_XIAO[DZ.index(nian[:zhi])]

    {
      name: name, gender: gender,
      year: y, month: m, day: d, hour: h, min: mi,
      nian: nian, yue: yue, ri: ri, shi: shi,
      tai: tai, ming: ming, shen: shen,
      sheng_xiao: sx,
      da_yun: dy_result[:da_yun],
      qi_yun: dy_result[:qi_yun],
      ren_yuan: ry,
      true_solar: tst
    }
  end

  # ========== 为展示构建柱信息 ==========
  def self.pillar_info(gan, zhi, ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: nil, twin: 1)
    cg_list = if twin == 2 && TWIN_PILLARS.include?(pillar_type)
      ZHI_TWIN_CANG[zhi] || CANG_GAN[zhi] || []
    else
      CANG_GAN[zhi] || []
    end
    cg_text = cg_list.map { |c| "#{c} #{shi_shen(ri_gan, c)}" }.join(' / ')
    kw = if "#{gan}#{zhi}" == "#{ri_gan}#{ri_zhi}"
           KONG_WANG["#{ri_gan}#{ri_zhi}"] || '—'
         else
           KONG_WANG["#{gan}#{zhi}"] || '—'
         end
    kw = '—' if kw.empty?

    sh = if "#{gan}#{zhi}" == "#{ri_gan}#{ri_zhi}"
           shen_sha(ri_gan, ri_zhi, nian_zhi, yue_zhi)
         else
           '—'
         end

    {
      gan: gan, zhi: zhi,
      shi_shen: shi_shen(ri_gan, gan),
      shi_shen_zhi: zhi_shi_shen(ri_gan, zhi, twin: twin, pillar_type: pillar_type),
      nayin: NAYIN["#{gan}#{zhi}"] || '',
      xing_yun: chang_sheng(ri_gan, zhi),
      zi_zuo: chang_sheng(gan, zhi),
      kong_wang: kw,
      cang_gan: cg_text,
      shen_sha: sh
    }
  end

  # ========== API 端点 ==========
  get "/paipan" do
    # 参数校验 — 使用 query (query string 为字符串 key)
    y = (query["year"]  || 1982).to_i
    m = (query["month"] || 10).to_i
    d = (query["day"]   || 18).to_i
    h = (query["hour"]  || 5).to_i
    mm = (query["min"]  || 0).to_i
    return json(error: "invalid date") if m < 1 || m > 12 || d < 1 || d > 31

    req_params = {
      name:   query["name"]   || '未命名',
      gender: query["gender"] || '男',
      year:   y, month: m, day: d, hour: h, min: mm,
      lng:    query["lng"]&.to_f
    }
    data = self.class.paipan(req_params)
    twin = (query["twin"] || 1).to_i

    ri_gan  = data[:ri][:gan]
    ri_zhi  = data[:ri][:zhi]
    nian_zhi = data[:nian][:zhi]
    yue_zhi  = data[:yue][:zhi]

    # 构建各柱信息
    pillars = {
      nian: self.class.pillar_info(data[:nian][:gan], data[:nian][:zhi], ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: :nian, twin: twin),
      yue:  self.class.pillar_info(data[:yue][:gan],  data[:yue][:zhi],  ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: :yue,  twin: twin),
      ri:   self.class.pillar_info(data[:ri][:gan],   data[:ri][:zhi],   ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: :ri,   twin: twin),
      shi:  self.class.pillar_info(data[:shi][:gan],  data[:shi][:zhi],  ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: :shi,  twin: twin),
      tai:  self.class.pillar_info(data[:tai][:gan],  data[:tai][:zhi],  ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: :tai,  twin: twin),
      ming: self.class.pillar_info(data[:ming][:gan], data[:ming][:zhi], ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: :ming, twin: twin),
      shen: self.class.pillar_info(data[:shen][:gan], data[:shen][:zhi], ri_gan, ri_zhi, nian_zhi, yue_zhi, pillar_type: :shen, twin: twin)
    }

    # 当前大运和流年
    now_year = Time.now.year
    cur_dy_idx = data[:da_yun].rindex { |dy| dy[:start_year] <= now_year } || 0
    cur_dy = data[:da_yun][cur_dy_idx]
    cur_ln = self.class.liu_nian_jz(now_year)
    cur_ln_gan = cur_ln[0]; cur_ln_zhi = cur_ln[1]

    json({
      name:       data[:name],
      gender:     data[:gender],
      year:       data[:year],
      month:      data[:month],
      day:        data[:day],
      hour:       data[:hour],
      min:        data[:min],
      sheng_xiao: data[:sheng_xiao],
      true_solar: data[:true_solar],
      ren_yuan:   data[:ren_yuan],
      qi_yun:     data[:qi_yun],
      pillars:    pillars,
      da_yun:     data[:da_yun],
      da_yun_info: data[:da_yun].map { |dy|
        self.class.pillar_info(dy[:gan], dy[:zhi], ri_gan, ri_zhi, nian_zhi, yue_zhi)
          .merge(start_age: dy[:start_age], start_year: dy[:start_year])
      },
      cur_da_yun: self.class.pillar_info(cur_dy[:gan], cur_dy[:zhi], ri_gan, ri_zhi, nian_zhi, yue_zhi)
                     .merge(start_age: cur_dy[:start_age], start_year: cur_dy[:start_year], idx: cur_dy_idx),
      cur_liu_nian: self.class.pillar_info(cur_ln_gan, cur_ln_zhi, ri_gan, ri_zhi, nian_zhi, yue_zhi),
      now_year: now_year
    })
  end

  # 查看流年详情（点击大运中的某一年）
  get "/liunian" do
    y = (params[:year]  || 1982).to_i
    m = (params[:month] || 10).to_i
    d = (params[:day]   || 18).to_i
    h = (params[:hour]  || 5).to_i
    mm = (params[:min]  || 0).to_i
    return json(error: "invalid date") if m < 1 || m > 12 || d < 1 || d > 31

    req_params = {
      name:   params[:name]   || '未命名',
      gender: params[:gender] || '男',
      year:   y, month: m, day: d, hour: h, min: mm,
      lng:    params[:lng]&.to_f
    }
    data = self.class.paipan(req_params)
    ri_gan = data[:ri][:gan]
    ri_zhi = data[:ri][:zhi]
    nian_zhi = data[:nian][:zhi]
    yue_zhi  = data[:yue][:zhi]

    ln_year = params[:ln_year].to_i
    ln_gz = self.class.liu_nian_jz(ln_year)
    ln_gan = ln_gz[0]; ln_zhi = ln_gz[1]

    json(self.class.pillar_info(ln_gan, ln_zhi, ri_gan, ri_zhi, nian_zhi, yue_zhi))
  end


  # 独立页面 — 完整版（来自排盘.app standalone.html）
  get "/standalone" do
    html_path = File.join(self.class.ext_dir, "standalone.html")
    if File.exist?(html_path)
      html = File.read(html_path, encoding: "UTF-8")
      raise Clacky::ApiExtension::Halt.new(200, html, "text/html; charset=utf-8")
    else
      error!("standalone.html not found", status: 500)
    end
  end
  get "/" do
    json(message: "八字排盘 · 从真版 API", endpoints: ["/paipan", "/liunian", "/standalone"])
  end
end
