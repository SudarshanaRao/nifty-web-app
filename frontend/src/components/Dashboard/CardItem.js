import React from 'react';

function CardItem() {
    return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-icon">
          {/* <img src="#" alt="Orders" /> */}
        </div>
        <div className="order-info">
          <p>Total Orders</p>
          <h2>13,647</h2>
        </div>
      </div>
      <div className="order-footer">
        <div className="stats-background">
          <span className="increase">▲ 2.3%</span>
          <span>Last Week</span>
          {/* <a href="#">View More</a> */}
        </div>
      </div>
    </div>
  );
}

export default CardItem;