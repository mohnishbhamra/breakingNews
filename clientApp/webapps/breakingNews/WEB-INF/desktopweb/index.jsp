
<%@ page contentType="text/html; charset=UTF-8" import="java.net.URLEncoder,java.util.*,com.kony.web.WEBConstants,com.kony.web.util.WAPConfigUtility,com.kony.web.KonyAppConfig" %>
    <%
    response.setDateHeader("Expires", (new Date(0)).getTime());
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0");
    response.setHeader("Pragma", "no-cache");
    %>


<%
    KonyAppConfig appConfig = (KonyAppConfig) application.getAttribute(WEBConstants.KONY_APP_CONFIG);
    String propertiesJSON = "";
    String headersJSON = "";
    String paramsJSON = "";
    if(appConfig!=null ){
    propertiesJSON = (String) application.getAttribute(appConfig.getAppID() + WEBConstants.THINCLIENT_PROPERTIES + "_JSON");

    headersJSON = (String) request.getAttribute("headersJSON");
    paramsJSON = (String) request.getAttribute("paramsJSON");
    }
  %>




<!DOCTYPE html>
<html >
    <head> <% String userAgent = request.getHeader("user-agent"); if(userAgent != null && userAgent.toLowerCase().contains("trident")){%><meta http-equiv="X-UA-Compatible" content="IE=edge"><%}%> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        
        
        
        
        
        
<script type="text/javascript"> 
if (document.getElementById && document.createElement) {
    document.write("<style>html {display: none;}</style><script>if( self == top ){document.documentElement.style.display = 'block';} else {top.location = self.location;}</sc"+"ript>");
}
else {
    if (top != self) {
        top.location = self.location;
    }
}
</script>

        <script type="text/javascript">
             
                        
                        IndexJL = 0;
                        
        </script>

        
         
   
 
   

        <style type="text/css" media="screen">
    .splash {
        position: absolute;
        top: 0px;
        right: 0px;
        left: 0px;
        bottom: 0px;
        
        background-color: #ffffff;   
        
        animation: fadein 1.5s ease-in;
        -moz-animation: fadein 1.5s ease-in;
    }

    @-webkit-keyframes fadein
    {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    keyframes fadein
    {
        from { opacity: 0; }
        to { opacity: 1; }
    }
</style>






         

    

        <%
        boolean releasemode = false;
        //Do not remove the below comment. This is added for minification. During minification process, this will be un-commented.
        //releasemode = true;

        %>
    

    
    

    

    </head>
    <body style= "width:100%; margin: 0px; padding: 0px;" bodyalign="left" aria-busy='true' aria-live='polite' aria-relevant='additions' aria-atomic='false'>
    <DIV id="splashDiv">

            
        <input type="hidden" name="_reqHeaders" value='<%=headersJSON != null ? headersJSON : "" %>'>
                <input type="hidden" name="_reqParams" value='<%=paramsJSON != null ? paramsJSON : ""%>'>
        <input type="hidden" name="_konyAppProperties" value='<%=propertiesJSON != null ? propertiesJSON : ""%>'>
            
        <div id="splashScreen" class="splash" style=""></div>
            
                <% Object sessionObj = request.getSession(false); %>
        <div style="display:none" id="sessionId" ><%= request.getSession().getId() %></div>
        <%
                if(sessionObj == null || session.getAttribute("desktopweb") == null){
            %>
            <div id="isnewsession" style="display:none">true</div>
            <%
            session = request.getSession();
            session.setAttribute("desktopweb","desktopweb");
        }else{
            %>
            <div id="isnewsession" style="display:none">false</div>
            <%
        }
        %>
            
        <script type="text/javascript">

                    function loadcss() {
                        var link = document.createElement('link');
                        link.setAttribute('rel', 'stylesheet');
                        link.setAttribute('type', 'text/css');
                        link.setAttribute('href', 'desktopweb/konydesktop.css');
                        var head = document.getElementsByTagName('head')[0];
                        head.appendChild(link);
                    }


            
                <%if(releasemode){ %>
            
                      setTimeout(function() {
                            loadcss();
                            initappcache();
                    }, 0);
                    function initappcache ()
                    {
                        isIE=  window.navigator.appVersion.match(/MSIE (\d+)/) != null;
                        isIE8= window.navigator.appVersion.match(/MSIE (\d+)/) != null && RegExp.$1 == "8";
                        isIE9= window.navigator.appVersion.match(/MSIE (\d+)/) != null && RegExp.$1 == "9";
                        isIE10= navigator.userAgent.match(/MSIE (\d+)/) != null && RegExp.$1 == "10";
                        if (document.documentElement.getAttribute("manifest") && !! window.applicationCache) {
                                var a = ["checking", "downloading", "progress", "cached", "noupdate", "updateready", "obsolete", "error"];
                                for (var d = 0; d < a.length; d++) {
                                        window.applicationCache.addEventListener(a[d],appcacheeventhndlr, false)
                                }
                        } else {
                                //kony.appinit.loadlibrarysync();

                        }
                        loadKonyframework();

                    }

                    function appcacheeventhndlr(event)
                    {
                        if(!event)
                                event = window.event;
                        switch (event.type) {
                                case "checking":
                                        console.log("Checking for Manifest Version");
                                        break;

                                case "downloading":
                                        console.log("Downloading of Manifest Resources");
                                        break;

                                case "progress":
                                        break;

                                case "cached":
                                        console.log("Manifest Resources loading done");
                                        //loadKonyframework();
                                        break;

                                case "noupdate":
                                        console.log("No Change in Manifest File");
                                       // loadKonyframework();
                                        break;

                                case "updateready":
                                        console.log("New manifest resources downloaded,swap the cache");
                                        try{
                                            window.applicationCache.swapCache();
                                            //loadKonyframework();
                                            window.location.reload();
                                        }catch (e) {
                                            console.log("invalid state: swapping the cache");
                                        }
                                        break;

                                case "obsolete":
                                        console.log("Cache Manifest file not found. So deleting app cache");
                                        break;

                                case "error":
                                        console.log("Error while loading app cache");
                                        //loadKonyframework();
                                        break;

                                default:
                                        console.log("Appcache Event not supported");
                        }
                    }
            
                    function initializeframework()
                    {
                        kony.appinit.prepareHttpHeaders();
                        $KG["skipproxy"] = true;
                        kony.appinit.verifyhref(true);
                    }

                    function loadKonyframework()
                    {
                        appStartTime = new Date().getTime();
                        addScript("jslib/konyframework.js");
                    }

                    function loadappjs()
                    {

                        $KG["platformver"] = "desktopweb/";
                        $KG["rcid"] = "spadesktopweb";
                        $KG["version"] = "1.0.0";
                        $KG["staticContentPath"] =  "";
                        $KG["imagecat"] =  "";
                        $KG["retina"] = "";

                        addScript("appjs/app.js");
                    }

                    function addScript (src)
                    {
                        var head =  document.getElementsByTagName('head')[0];
                        var script = document.createElement('script');
                        script.src = "desktopweb/" + src;
                        script.type = "text/javascript";

                       if(src ==="appjs/app.js" || src ==="appjs/appie.js"){
                            if(!script.addEventListener) {
                                script.onreadystatechange = function(){
                                        (this.readyState == 'complete' || this.readyState == 'loaded') && initializeframework();
                                };
                            }
                            else {
                                script.onload = initializeframework;
                            }
                        }
                        else{
                            if(!script.addEventListener) {
                                script.onreadystatechange = function(){
                                        (this.readyState == 'complete' || this.readyState == 'loaded') && loadappjs();
                                };
                            }
                            else {
                                script.onload = loadappjs;
                            }
                        }

                          head.appendChild(script);
                    }

                <%}else{%>
            
                    loadcss();
                    function initappcache()
                    {

                            $KG["platformver"] = "desktopweb/";
                            $KG["rcid"] = "spadesktopweb";
                            $KG["version"] = "1.0.0";
                            $KG["staticContentPath"] =  "";

                            kony.appinit.initappcache();
                    }
                    var head = document.getElementsByTagName('head')[0];
                    var script = document.createElement('script');
                    appStartTime = new Date().getTime();
                    script.src = "desktopweb/jslib/konyinit.js";
                    //onreadystatechange for IE, IE9 supports both onload and onreadystatechange.
                    if(!script.addEventListener){
                            script.onreadystatechange = function(){
                                    (this.readyState == 'complete' || this.readyState == 'loaded') && initappcache();
                            };
                    }
                    else
                    script.onload = initappcache;
                    head.appendChild(script);

                 <%}%> 

            </script>
 <style>
    #JavaScriptDisabledErrorMsg { display:none; }
 </style>
 <noscript>
    <style type='text/css'>
        form {display: none !important}
        * html ul li {height:1em; vertical-align:bottom;}
        html {display : block}
        #JavaScriptDisabledErrorMsg {display:block;}
        #splashScreen_main{display:none;}
    </style>
 </noscript>
 <div id="JavaScriptDisabledErrorMsg"> To use this site, first enable your browser's JavaScript support and then refresh this page. </div>
 </DIV>
    </body>
</html>