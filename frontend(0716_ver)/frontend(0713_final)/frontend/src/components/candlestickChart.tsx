import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import styled from 'styled-components';

const Section = styled.section`
  padding-top: 20px;
  border-top: 1px solid #333;
  .apexcharts-title-text {
    color: red;
  }
`;

/** 빨간색과 파란색으로 표시되는 캔들 차트를 출력하는 컴포넌트입니다 */
const CandlestickChart = ({ stockCode, width }) => {
  const [stockData, setStockData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://3.34.171.35:5002/stock/api/stock_data?code=${stockCode}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const sortedData = Object.keys(data).sort().map(key => ({
          date: new Date(parseInt(key)),
          stck_oprc: data[key].시가,
          stck_hgpr: data[key].고가,
          stck_lwpr: data[key].저가,
          stck_clpr: data[key].종가,
        }));
        setStockData(sortedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [stockCode]);

  const dataList = stockData.map(el => ({
    x: el.date,
    y: [Number(el.stck_oprc), Number(el.stck_hgpr), Number(el.stck_lwpr), Number(el.stck_clpr)],
  }));

  const chartData = {
    series: [
      {
        data: dataList,
      },
    ],
    options: {
      chart: {
        type: 'candlestick',
        height: 350,
      },
      title: {
        text: '차트',
        align: 'left',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '14px',
          color: '#CCCCCC',
        },
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
        labels: {
          style: {
            colors: '#999',
          },
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          formatter: (value: number) => {
            const date = new Date(value);
            return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
          },
          style: {
            colors: '#999',
          },
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#ed3738',
            downward: '#097df3',
          },
        },
      },
      zoom: {
        enabled: true,
        type: 'x',
        resetIcon: {
          offsetX: -10,
          offsetY: 0,
          fillColor: '#fff',
          strokeColor: '#37474F',
        },
        selection: {
          background: '#90CAF9',
          border: '#0D47A1',
        },
      },
    },
  };

  return (
    <Section>
      {dataList.length > 0 ? (
        <Chart options={chartData.options} series={chartData.series} type="candlestick" height={300} width={width} />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </Section>
  );
};

export default CandlestickChart;
