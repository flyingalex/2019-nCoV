import React, { useEffect, useState } from 'react';
import * as d3 from "d3";
import china_cities from './data/china_cities.json';
import china_provinces from './data/china_provinces.json';
import result from './data/result.json';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [showName, setShowName] = useState(false);
  const [m, setM] = useState([0, 0]);
  const width = 960, height = 600;
  const rateById = d3.map();
  useEffect(() => {
    result.forEach(item => {
      if (item.cities.length === 0) {
        rateById.set(item.provinceName, item.confirmedCount);
      } else {
        item.cities.forEach(city => {
          rateById.set(city.cityName, city.confirmedCount);
        });
      }
    });
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
            const { name } = d.properties;
            const count = rateById.get(name) || rateById.get(name.substring(0, name.length - 1)) || 0;
            if (count === 0) {
              return 'q0';
            } else if (count < 10) {
              return 'q1';
            } else if (count < 100) {
              return 'q2';
            } else if (count < 500) {
              return 'q3';
            } else if (count < 1000) {
              return 'q4';
            } else {
              return 'q5';
            }
          })
          .attr("d", path)
          .on("mouseout", () => {
            console.log('mouseout');
            setShowName(false);
          })
          .on("mouseover", (d) => {
              const m = d3.mouse(d3.select("body").node());
              setM(m);
              setShowName(true);
              setName(d.properties.name);
              console.log('mouseover');
          });
      // svg.append("g")
      //     .attr("class", "provinces")
      //     .selectAll("path")
      //     .data(provinces.features)
      //     .enter()
      //     .append("path")
      //     .attr("d", path);
    };
    const fetchData = async () => {
      makeMap([china_cities, china_provinces]);
    };
    fetchData();
  }, []);
  console.log('m:', m);
  return (
    <div className="app">
      {showName &&
        <div
          className="tooltip"
          style={{
            position: "absolute",
            left: `${m[0] + 10}px`,
            top: `${m[1] -10}px`,
          }}
        >
          <label>
            <span>{name}</span>
          </label>
        </div>
      }
      <div className="svg-wrapper">
        <svg width={width} height={height}></svg>
      </div>
    </div>
  );
}

export default App;
