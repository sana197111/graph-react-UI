// StandardsGraph.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const StandardNetwork = () => {
  const [searchTerm, setSearchTerm] = useState('IEC 60633');
  const [standardData, setStandardData] = useState(null);
  const networkRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`http://localhost:5000/api/standards?subcommittee_standard_no=${searchTerm}`);
      setStandardData(response.data);
    };

    fetchData();
  }, [searchTerm]);

  useEffect(() => {
    if (standardData) {
      const nodes = new DataSet(
        standardData.map((item) => ({
          id: item.node,
          label: item.node,
          color: item.details.owned ? '#2196f3' : '#9e9e9e',
          title: `
            <p>Title: ${item.details.title}</p>
            <p>Version: ${item.details.version}</p>
            <p>Year: ${item.details.year}</p>
          `,
        }))
      );

      const edges = new DataSet(
        standardData
          .filter((item) => item.parent)
          .map((item) => ({
            from: item.parent,
            to: item.node,
            label: '연계 규격',
          }))
      );

      const data = {
        nodes: nodes,
        edges: edges,
      };

      const options = {
        nodes: {
          shape: 'box',
          font: {
            color: '#fff',
          },
        },
        edges: {
          arrows: 'to',
        }
      };

      const network = new Network(networkRef.current, data, options);

      network.once('initRedraw', () => {
        if (network.canvas && network.canvas.canvas) {
          network.canvas.canvas.style.height = '100%';
        }
      });
    }
  }, [standardData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.elements.search.value);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ height: '100vh' }}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">IEC 60633 Network</h1>
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            name="search"
            defaultValue={searchTerm}
            className="border border-gray-300 rounded px-2 py-1 mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
            Search
          </button>
        </form>
      </div>
      <div ref={networkRef} className="flex-1" style={{ height: '600px' }} />
    </div>
  );
};

export default StandardNetwork;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Tree from 'react-d3-tree';

// const nodeColor = (owned) => (owned ? '#FFD700' : '#A9A9A9');

// const renderRectSvgNode = ({ nodeDatum, toggleNode, onNodeClick }) => (
//   <g>
//     <rect
//       width="200"
//       height="40"
//       x="-100"
//       y="-20"
//       rx="10"
//       ry="10"
//       fill={nodeColor(nodeDatum.attributes.owned)}
//       onMouseOver={(event) => {
//         const tooltip = document.getElementById('tooltip');
//         tooltip.innerHTML = `
//           <p>Title: ${nodeDatum.title}</p>
//           <p>Description: ${nodeDatum.attributes.description}</p>
//           <p>Owned: ${nodeDatum.attributes.owned ? 'Yes' : 'No'}</p>
//         `;
//         tooltip.style.display = 'block';
//         tooltip.style.left = `${event.pageX + 10}px`;
//         tooltip.style.top = `${event.pageY + 10}px`;
//       }}
//       onMouseOut={() => {
//         const tooltip = document.getElementById('tooltip');
//         tooltip.style.display = 'none';
//       }}
//       onClick={() => onNodeClick(nodeDatum)}
//     />
//     <text fill="black" strokeWidth="1" x="0" y="0" textAnchor="middle" dominantBaseline="middle">
//       {nodeDatum.title}
//     </text>
//   </g>
// );

// const StandardsGraph = () => {
//   const [standardNo, setStandardNo] = useState('IEC 60633');
//   const [graphData, setGraphData] = useState(null);

//   useEffect(() => {
//     fetchStandardsData();
//   }, []);

//   const fetchStandardsData = async () => {
//     try {
//       const response = await axios.get(`http://localhost:5000/api/standards?subcommittee_standard_no=${standardNo}`);
//       setGraphData(response.data);
//     } catch (error) {
//       console.error('Error fetching standards data:', error);
//     }
//   };

//   const transformGraphData = (data, standardNo) => {
//     const nodeMap = {};

//     data.forEach((item) => {
//       nodeMap[item.node] = {
//         title: item.node,
//         attributes: item.details,
//         children: [],
//       };
//     });

//     data.forEach((item) => {
//       if (item.parent && nodeMap[item.parent]) {
//         nodeMap[item.parent].children.push(nodeMap[item.node]);
//       }
//     });

//     // standardNo를 기준으로 트리 구조 재구성
//     const rootNode = nodeMap[standardNo];
//     data.forEach((item) => {
//       if (item.depth === -1 && item.node !== standardNo) {
//         rootNode.children.push(nodeMap[item.node]);
//       }
//     });

//     return rootNode;
//   };

//   const handleNodeClick = (nodeDatum) => {
//     setStandardNo(nodeDatum.title);
//     fetchStandardsData();
//   };

//   return (
//     <div className="p-4">
//       <input
//         type="text"
//         value={standardNo}
//         onChange={(e) => setStandardNo(e.target.value)}
//         placeholder="규격 번호 입력"
//         className="border border-gray-300 rounded px-2 py-1 mb-4"
//       />
//       <button onClick={fetchStandardsData} className="bg-blue-500 text-white rounded px-4 py-2">
//         그래프 보여주기
//       </button>

//       {graphData && (
//         <div id="tree-container" style={{ width: '100%', height: '500px' }}>
//           <Tree
//             data={transformGraphData(graphData, standardNo)}
//             renderCustomNodeElement={(rd3tProps) =>
//               renderRectSvgNode({ ...rd3tProps, onNodeClick: handleNodeClick })
//             }
//             orientation="vertical"
//             translate={{ x: window.innerWidth / 2, y: 200 }}
//           />
//         </div>
//       )}

//       <div id="tooltip" className="tooltip"></div>
//     </div>
//   );
// };

// export default StandardsGraph;