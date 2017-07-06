var Player =
{
  isMuted: false,
  isPlaying: false,
  
  duration: 0,
  current: 0,
  
  mute: function()
  {
    this.isMuted = this.isMuted ? false : true;
    if(window.console) console.log(this.isMuted ? 'Muted' : 'Unmuted');
    
    return this
  },
  
  play: function()
  {
    this.isPlaying = this.isPlaying ? false : true;
    if(window.console) console.log(this.isPlaying ? 'Playing' : 'Paused');
    
    return this
  },
  
  skip: function(d)
  {
    if(window.console) console.log('Skipping', d == 'l' ? 'Backwards' : 'Forwards')
    
    this.current = 0;
    
    return this
  },
  
  vol: function(v)
  {
    if(window.console) console.log('Set volume to:', v, '%');
    
    return this
  },
  
  setDuration: function(s)
  {
    this.duration = s;
    
    var m = 0;
    while(s > 60) { m ++; s -= 60 }
    while(String(s).length == 1) s = '0' + s;
    
    $('.music-player > .dash > .info > i > [name="duration"]').html(m + ':' + s);
    
    return this
  },
  
  setCurrent: function(s)
  {
    this.current = s;
    
    var m = 0, pct = this.current / this.duration;
    while(s > 60) { m ++; s -= 60 }
    while(String(s).length == 1) s = '0' + s;
    
    $('.music-player > .dash > .info > i > [name="current"]').html(m + ':' + s);
    
    $('.music-player > .dash > a[href="#seek"]:not(:active)').each(function()
    {
      var rotate = 'rotate(-' + ((pct * 180) + 90) + 'deg)';
      
      $(this).add('.music-player > .dash > .seeker > .wheel > .progress').css(
      {
        '-webkit-transform': rotate,
        '-moz-transform': rotate,
        '-ms-transform': rotate,
        '-o-transform': rotate,
        'transform' : rotate
      });
    });
    
    return this
  },
  
  playing: function()
  {
    if(!this.isPlaying)
      return this;
    
    if(this.current > (this.duration - 1))
      this.skip('r');
    else
      this.setCurrent(this.current + 1);
    
    return this
  }
};

$(function()
{
  setInterval(function(){ Player.playing() }, 1000);
  Player.setDuration(230);
  Player.setCurrent(180);
  
  Player.play();
  
  $('.music-player > .dash > a[href="#mute"]').click(function()
  {
    $(this).toggleClass('fa-volume-up fa-volume-off');
    Player.mute();
    
    return !1;
  });
  
  $('.music-player > .dash > .controls > a[href="#play"]').click(function()
  {
    $(this).toggleClass('fa-play fa-pause');
    Player.play();
    
    return !1;
  });
  
  $('.music-player > .dash > .controls > a[href="#back"]').click(function(){ Player.skip('l'); return !1 });
  $('.music-player > .dash > .controls > a[href="#forward"]').click(function(){ Player.skip('r'); return !1 });
  
  $('.music-player > .dash > .volume-level').bind('mousemove', function(e)
  {
    if($(this).is(':active'))
    {
      $(this).find('em').css('width', e.pageX - $(this).offset().left);
      var vol = $(this).find('em').width() / $(this).width() * 100;
      
      Player.vol(vol > 100 ? 100 : vol);
    }
  });
  
  $('.music-player').on('mousemove', function(e)
  {
    //http://jsfiddle.net/sandeeprajoria/x5APH/11/
    
    var wheel = $(this).find('.dash > .seeker > .wheel'), rotate,
      x = (e.pageX - 20) - wheel.offset().left - wheel.width() / 2,
      y = -1 * ((e.pageY - 20) - wheel.offset().top - wheel.height() / 2),
      deg = (90 - Math.atan2(y, x) * (180 / Math.PI)), pct, nc, nm = 0;
      if(deg > 270) deg = 270; else if(deg < 90) deg = 90;
      rotate = 'rotate(' + deg + 'deg)';
      pct = deg; pct = 270 - pct; pct = pct / 180;
      nc = Math.round(Player.duration * pct);
  
    $(this).find('.dash > a[href="#seek"]:active').each(function()
    {
      Player.current = nc;
      while(nc > 60) { nm ++; nc -= 60 }
      while(String(nc).length == 1) nc = '0' + nc;
      
      $('.music-player > .dash > .info > i > [name="current"]').html(nm + ':' + nc);
      
      $(this).add('.music-player > .dash > .seeker > .wheel > .progress').css(
      {
        '-webkit-transform': rotate,
        '-moz-transform': rotate,
        '-ms-transform': rotate,
        '-o-transform': rotate,
        'transform' : rotate
      });
    });
  });
});