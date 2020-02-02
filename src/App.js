import React, { useEffect, useState } from 'react';
import * as d3 from "d3";
import china_cities from './data/china_cities.json';
import china_provinces from './data/china_provinces.json';
import result from './data/result.json';
import './App.css';

function App() {
  const [city, setCity] = useState({
    cityName: "",
    confirmedCount: 0,
    suspectedCount: 0,
    curedCount: 0,
    deadCount: 0,
  });
  const [showName, setShowName] = useState(false);
  const [m, setM] = useState([0, 0]);
  const width = 960, height = 600;
  useEffect(() => {
    const rateById = d3.map();
    result.forEach(item => {
      if (item.cities.length === 0) {
        rateById.set(item.provinceName, {
          ...item,
          cityName: item.provinceName,
        });
      } else {
        item.cities.forEach(city => {
          rateById.set(city.cityName, city);
        });
      }
    });
    const getCity = (name) => {
      return rateById.get(name) ||
      rateById.get(name.substring(0, name.length - 1)) ||
      rateById.get(name.substring(0, name.length - 2)) ||
      rateById.get(name.substring(0, name.length - 2)) ||
      rateById.get(name.replace('哈萨克自治', ''));
    };
    const svg = d3.select("svg");
    const proj = d3.geoMercator().center([105, 38]).scale(750).translate([width/2, height/2]);
    const path = d3.geoPath().projection(proj);
    const makeMap = ([cities, provinces]) => {
      svg.append("g")
        .attr("class", "cities")
        .selectAll("path")
        .data(cities.features)
        .enter()
        .append("path")
        .attr("class", function(d) {
          // 颜色相关class
          const city = getCity(d.properties.name);
          if (city) {
            const count = city.confirmedCount;
            if (count === 0) {
              return 'q0';
            } else if (count < 10) {
              return 'q1';
            } else if (count < 100) {
              return 'q2';
            } else if (count < 500) {
              return 'q3';
            } else if (count <= 1000) {
              return 'q4';
            } else {
              return 'q5';
            }
          }
          return 'q0';
        })
        .attr("d", path)
        .on("mouseout", () => {
          setShowName(false);
        })
        .on("mouseover", (d) => {
            const m = d3.mouse(d3.select("body").node());
            setM(m);
            setShowName(true);
            const { name } = d.properties;
            const city = getCity(name);
            if (city) {
              setCity(city);
            } else {
              setCity({
                cityName: name,
                confirmedCount: 0,
                suspectedCount: 0,
                curedCount: 0,
                deadCount: 0,
              });
            }
        });
      // 图例
      const data = [
        { color: '#70161d', text: '> 1000' },
        { color: '#cb2a2f', text: '500-1000' },
        { color: '#e55a4e', text: '100-499' },
        { color: '#f59e83', text: '10-99' },
        { color: '#fdebcf', text: '1-9' },
      ];
      const tooltip = svg
        .append("g")
        .attr("transform", "translate(20, 50)")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
          return `translate(0, ${i * 40})`;
        });

      tooltip
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function (d, i) {
            return d.color;
        });
      tooltip
        .append("text")
        .attr("transform", "translate(30, 15)")
        .style("fill", 'black')
        .text(function (d, i) {
            return d.text;
        });
      svg
        .append("g")
        .append("text")
        .attr("transform", "translate(330, 20)")
        .text("中国新型冠状病毒 2019-nCoV市级分布图");

      const province = svg.append("g")
        .attr("class", "provinces")
        .selectAll("path")
        .data(provinces.features)
        .enter();

      province
        .append("path")
        .attr("d", path);

      // add province name
      // province
      //   .append("text")
      //   .text(function (d, i) {
      //     return d.properties.name;
      //   })
      //   .attr("fill", "rgba(6,85,178,0.5)")
      //   .attr("x", function (d) {
      //       var local = proj([d.properties.cp[0], d.properties.cp[1]])
      //       return local[0]
      //   })
      //   .attr("y", function (d) {
      //       var local = proj([d.properties.cp[0], d.properties.cp[1]])
      //       return local[1]
      //   })
      //   .style('font-weight', '100')
      //   .style("font-size", "10px");
    };
    const fetchData = async () => {
      makeMap([china_cities, china_provinces]);
    };
    fetchData();
  }, []);
  return (
    <div className="app">
      {showName && city.cityName &&
        <div
          className="tooltip"
          style={{
            position: "absolute",
            left: `${m[0] + 10}px`,
            top: `${m[1] -10}px`,
          }}
        >
          <div>
            <span>{city.cityName}</span>
          </div>
          <div>
            <span>确诊: {city.confirmedCount}</span>
          </div>
          <div>
            <span>死亡: {city.deadCount}</span>
          </div>
          <div>
            <span>治愈: {city.curedCount}</span>
          </div>
        </div>
      }
      <div className="svg-wrapper">
        <svg width={width} height={height}></svg>
      </div>

      <div className="note">
        数据来自丁香园: <a rel="noopener noreferrer" target="_blank" href="https://ncov.dxy.cn/ncovh5/view/pneumonia">https://ncov.dxy.cn/ncovh5/view/pneumonia</a>
        <br/>
        地图数据来自: <a rel="noopener noreferrer" target="_blank" href="https://github.com/zhshi/d3js-footprint">https://github.com/zhshi/d3js-footprint</a>
        <br/>
        该项目用于学习用，权威数据请参考官方信息
        <br/>
        如有问题，请联系<a href="mailto:hulinalex@163.com">hulinalex@163.com</a>
      </div>
    </div>
  );
}

export default App;
