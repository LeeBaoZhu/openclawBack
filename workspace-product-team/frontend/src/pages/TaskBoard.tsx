// 任务执行看板页面（REQ-002）

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Switch, Space, message, Row, Col, Statistic, Progress } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getCronJobs, runCronJob, toggleCronJob } from '../api/cron';
import type { CronJob, CronStats } from '../types';
import ReactECharts from 'echarts-for-react';

export default function TaskBoard() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [stats, setStats] = useState<CronStats | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getCronJobs();
      if (response.success) {
        setJobs(response.data.jobs);
        setStats(response.data.stats);
      }
    } catch (error) {
      message.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRun = async (id: string) => {
    try {
      const response = await runCronJob(id);
      if (response.success) {
        message.success('任务已触发，将在后台执行');
        loadData();
      }
    } catch (error) {
      message.error('触发任务失败');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const response = await toggleCronJob(id, enabled);
      if (response.success) {
        message.success(enabled ? '任务已启用' : '任务已禁用');
        loadData();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const columns: ColumnsType<CronJob> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'ok' ? '🟢 正常' : status === 'warning' ? '🟡 警告' : '🔴 失败'}
        </Tag>
      ),
    },
    {
      title: '调度时间',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 120,
    },
    {
      title: '上次执行',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '下次执行',
      dataIndex: 'nextRunAt',
      key: 'nextRunAt',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '连续错误',
      dataIndex: 'consecutiveErrors',
      key: 'consecutiveErrors',
      width: 100,
      render: (count: number) => count > 0 ? <Tag color="error">{count}次</Tag> : '0',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRun(record.id)}
            disabled={!record.enabled}
          >
            手动触发
          </Button>
          <Switch
            checked={record.enabled}
            onChange={(checked) => handleToggle(record.id, checked)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
        </Space>
      ),
    },
  ];

  const getHeatmapOption = () => {
    // 生成热力图数据（示例）
    const data: any[] = [];
    jobs.forEach((job, i) => {
      for (let j = 0; j < 24; j++) {
        data.push([j, i, Math.random() > 0.8 ? 0 : 1]);
      }
    });

    return {
      tooltip: {
        position: 'top',
      },
      grid: {
        height: '70%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        splitArea: { show: true },
      },
      yAxis: {
        type: 'category',
        data: jobs.map(j => j.name.substring(0, 10)),
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#52c41a', '#faad14', '#ff4d4f'],
        },
      },
      series: [
        {
          name: '执行状态',
          type: 'heatmap',
          data: data,
          label: { show: false },
        },
      ],
    };
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="总任务数" value={stats?.total || 0} />
          </Col>
          <Col span={6}>
            <Statistic title="正常" value={stats?.ok || 0} valueStyle={{ color: '#52c41a' }} />
          </Col>
          <Col span={6}>
            <Statistic title="警告" value={stats?.warning || 0} valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={6}>
            <Statistic title="失败" value={stats?.error || 0} valueStyle={{ color: '#ff4d4f' }} />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Progress
              percent={stats?.successRate || 0}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={(percent) => `执行成功率：${percent?.toFixed(1)}%`}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={24}>
          <Card
            title="任务列表"
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadData}>
                刷新
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={jobs}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="任务执行时间热力图（近 24 小时）">
            <ReactECharts option={getHeatmapOption()} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
