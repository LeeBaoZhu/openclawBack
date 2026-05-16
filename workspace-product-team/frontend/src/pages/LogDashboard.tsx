// 日志仪表盘页面（REQ-001）

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Space, Select, Typography, Progress } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getHealthDashboard, getHealthTrends, getHealthAlerts } from '../api/health';
import type { HealthDashboard, TrendDataPoint, Alert } from '../types';
import ReactECharts from 'echarts-for-react';

const { Title } = Typography;
const { Option } = Select;

export default function LogDashboard() {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trendDays, setTrendDays] = useState<number>(7);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, trendsRes, alertsRes] = await Promise.all([
        getHealthDashboard(),
        getHealthTrends(trendDays),
        getHealthAlerts(10),
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (trendsRes.success) setTrends(trendsRes.data.series);
      if (alertsRes.success) setAlerts(alertsRes.data.alerts);
    } catch (error) {
      console.error('加载失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [trendDays]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'ok': return { text: '健康', color: '#52c41a' };
      case 'warning': return { text: '警告', color: '#faad14' };
      case 'error': return { text: '异常', color: '#ff4d4f' };
      default: return { text: '未知', color: '#999' };
    }
  };

  const getTrendOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Error', 'Warning', 'Fatal'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trends.map(d => d.date.substring(5)), // MM-DD
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Error',
          type: 'line',
          data: trends.map(d => d.error),
          itemStyle: { color: '#ff4d4f' },
          areaStyle: {
            color: new (require('echarts').graphic.LinearGradient)(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255,77,79,0.3)' },
              { offset: 1, color: 'rgba(255,77,79,0.01)' },
            ]),
          },
        },
        {
          name: 'Warning',
          type: 'line',
          data: trends.map(d => d.warning),
          itemStyle: { color: '#faad14' },
          areaStyle: {
            color: new (require('echarts').graphic.LinearGradient)(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(250,173,20,0.3)' },
              { offset: 1, color: 'rgba(250,173,20,0.01)' },
            ]),
          },
        },
        {
          name: 'Fatal',
          type: 'line',
          data: trends.map(d => d.fatal),
          itemStyle: { color: '#722ed1' },
        },
      ],
    };
  };

  const getCategoryOption = () => {
    const categoryCount: Record<string, number> = {};
    alerts.forEach(a => {
      categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    });

    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: '5%',
        left: 'center',
      },
      series: [
        {
          name: '问题分类',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: Object.entries(categoryCount).map(([name, value]) => ({ name, value })),
        },
      ],
    };
  };

  const alertColumns: ColumnsType<Alert> = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const color = level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'default';
        return <Tag color={color}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: '告警信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat: string) => cat.replace(/_/g, ' '),
    },
    {
      title: '建议措施',
      dataIndex: 'suggestion',
      key: 'suggestion',
      ellipsis: true,
    },
    {
      title: '发生时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'resolved',
      key: 'resolved',
      width: 80,
      render: (resolved: boolean) => resolved ? <Tag color="success">已解决</Tag> : <Tag color="processing">未解决</Tag>,
    },
  ];

  const levelInfo = dashboard ? getLevelText(dashboard.level) : { text: '-', color: '#999' };

  return (
    <div>
      {/* 健康度仪表盘 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: getScoreColor(dashboard?.score || 0),
                }}
              >
                {dashboard?.score || 0}
              </div>
              <div style={{ fontSize: '16px', color: '#666' }}>健康度评分</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Tag color={levelInfo.color} style={{ fontSize: '16px', padding: '8px 16px' }}>
                {levelInfo.text}
              </Tag>
              <div style={{ marginTop: 16 }}>
                <Progress
                  type="dashboard"
                  percent={dashboard?.score || 0}
                  strokeColor={getScoreColor(dashboard?.score || 0)}
                  format={(percent) => `${percent?.toFixed(0)}分`}
                />
              </div>
            </div>
          </Col>
          <Col span={8}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#ff4d4f' }}>{dashboard?.summary.errorCount || 0}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Error</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#faad14' }}>{dashboard?.summary.warningCount || 0}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Warning</div>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#722ed1' }}>{dashboard?.summary.fatalCount || 0}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Fatal</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 趋势图和分类图 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card
            title="告警趋势"
            extra={
              <Select value={trendDays} onChange={setTrendDays} style={{ width: 100 }}>
                <Option value={7}>7 天</Option>
                <Option value={30}>30 天</Option>
              </Select>
            }
          >
            <ReactECharts option={getTrendOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="问题分类占比">
            <ReactECharts option={getCategoryOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 告警列表 */}
      <Card title="最近告警">
        <Table
          columns={alertColumns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
