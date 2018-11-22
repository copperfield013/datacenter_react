import React from 'react'
import { Spin,Alert,Switch,Card } from 'antd';

export default class Loadings extends React.Component{
	state = { loading: false }

  toggle = (value) => {
    this.setState({ loading: value });
  }

  render() {
    return (
      <div>
        <Card>
          <Spin spinning={this.state.loading}>
            <Alert
              message="Alert message title"
              description="Further details about the context of this alert."
              type="info"
            />
          </Spin>
          <div style={{ marginTop: 16 }}>
            Loading state：<Switch checked={this.state.loading} onChange={this.toggle} />
          </div>
        </Card>
        <Card>
            <Spin size="small" />
            <Spin size="dafault" />
            <Spin size="large" />
        </Card>
      </div>
    );
  }
}

