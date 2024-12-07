(function () {
  const script = document.currentScript;
  let dataBaseUrl = script.getAttribute('data-base-url');
  let dataPagePvId = script.getAttribute('data-page-pv-id');
  let dataPageUvId = script.getAttribute('data-page-uv-id');

  const WebViso = {};
  WebViso.version = '0.0.0';
  let BASE_API_PATH = 'https://webviso.yestool.org';

  WebViso.page_pv_id = "page_pv";
  WebViso.page_uv_id = "page_uv";
  if (dataBaseUrl) {
    BASE_API_PATH = dataBaseUrl;
  }
  if (dataPagePvId) {
    WebViso.page_pv_id = dataPagePvId;
  }
  if (dataPageUvId) {
    WebViso.page_uv_id = dataPageUvId;
  }

  /**
   * @description: init Fetch json from api
   * @return {Object}
   */
  WebViso.init = async function () {
    const thisPage = getLocation(window.location.href);
    const pagePvEle = document.getElementById(WebViso.page_pv_id);
    const pageUvEle = document.getElementById(WebViso.page_uv_id);
    const loadingMessage = document.getElementById('loading-message'); // 获取加载提示元素

    // 显示加载提示
    if (loadingMessage) {
      loadingMessage.style.display = 'inline';
    }

    const queryData = {
      url: thisPage.pathname,
      hostname: thisPage.hostname,
      referrer: document.referrer
    };
    if (pagePvEle) {
      queryData.pv = true;
    }
    if (pageUvEle) {
      queryData.uv = true;
    }
    await fetchJson(`${BASE_API_PATH}/api/visit`, queryData)
      .then((res) => {
        if (res.ret !== 'OK') {
          console.error('WebViso.init error', res.message);
          return;
        }
        const resData = res.data;

        // 隐藏加载提示
        if (loadingMessage) {
          loadingMessage.style.display = 'none';
        }

        // 只有在元素存在时，才更新内容
        if (pagePvEle) {
          pagePvEle.innerText = resData.pv;
        }
        if (pageUvEle) {
          pageUvEle.innerText = resData.uv;
        }
      })
      .catch((err) => {
        console.log("WebViso.init fetch error", err);
        // 隐藏加载提示
        if (loadingMessage) {
          loadingMessage.style.display = 'none';
        }
      });
  };

  /**
   * @description: Fetch json from api
   * @param {String} url response from url
   * @return {Object}
   */
  function fetchJson(url, data) {
    return new Promise((resolve) => {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(res => res.json())
        .then(function (data) {
          resolve(data);
        })
        .catch(err => {
          console.error(err);
        });
    });
  }

  const getLocation = function (href) {
    const l = document.createElement("a");
    l.href = href;
    return l;
  };

  // 等待 DOM 更新后再初始化
  if (typeof window !== 'undefined') {
    // 等待 WebViso.page_uv_id 和 WebViso.page_pv_id 元素出现
    const checkElementsExist = setInterval(() => {
      const pagePvEle = document.getElementById(WebViso.page_pv_id);
      const pageUvEle = document.getElementById(WebViso.page_uv_id);
      if (pagePvEle && pageUvEle) {
        clearInterval(checkElementsExist); // 停止轮询
        WebViso.init();
      }
    }, 100); // 每 100ms 检查一次

    window.WebViso = WebViso;
  }
})();
