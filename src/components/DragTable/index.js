import React from 'react'
import { Table } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import Units from './../../units'

let dragingIndex = -1;

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    if (dragIndex === hoverIndex) {
      return;
    }
    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow),
);

class DragSortingTable extends React.Component {
 
  componentDidMount(){
    this.props.onRef(this)
  }
  state = {
    data:[],
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      data: Units.uniq(nextProps.dataSource,"key"),
    })
  }
  getdata=()=>{
    const { data } = this.state;
    this.props.setdatasource(data)
  }
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];
    this.setState(
      update(this.state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
    )
  };

  render() {
    const {data,}=this.state
    return (
      <Table
        columns={this.props.columns}
        dataSource={data}
        components={this.components}
        pagination={false}
        bordered
        onRow={(record, index) => ({
          index,
          moveRow: this.moveRow,
        })}
      />
    );
  }
}

const DragTable = DragDropContext(HTML5Backend)(DragSortingTable);
export default DragTable