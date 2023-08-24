import { TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import {React,  useEffect, useState } from 'react';
import {createAPIEndpoint, ENDPOINTS} from '../../api';
import Table from "../../layouts/Table";
import DeleteOutlineTwoToneIcon from '@material-ui/icons/DeleteOutlineTwoTone';




export default function OrderList(props) {

    const {setOrderId,setOrderListVisibility, resetFormControls, setNotify} = props;
    const [orderList, setOrderList] = useState([]);

    const showForUpdate = id => {
        setOrderId(id);
        setOrderListVisibility(false);
    }

    useEffect(() =>{
        createAPIEndpoint(ENDPOINTS.ORDER).fetchAll()
        .then(res =>{
            console.log(res.data);
          setOrderList(res.data);
        })
        .catch(err => console.log(err))
    },[])

    const deleteOrder = id =>{
        if(window.confirm('Are you sure to delete this record?'))
        {
            createAPIEndpoint(ENDPOINTS.ORDER).delete(id)
            .then(res =>{
                setOrderListVisibility(false);
                setOrderId(0);
                resetFormControls();
                setNotify({isOpen :true, message :'Deleted successfuly.' })
            }).catch(err => console.log(err))
        }
    }
           

  return (
    <>
      <Table>
        <TableHead>
            <TableRow>
                <TableCell>Order no.</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Payed With</TableCell>
                <TableCell>Grand Total</TableCell>
                <TableCell></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {
                orderList.map(item =>(
                    <TableRow key={item.orderMasterId}>
                        <TableCell onClick={e => showForUpdate(item.orderMasterId)}>{item.orderNumber} </TableCell>
                        <TableCell onClick={e => showForUpdate(item.orderMasterId)}>{item.customer.customerName} </TableCell>
                        <TableCell onClick={e => showForUpdate(item.orderMasterId)}>{item.pMethod} </TableCell>
                        <TableCell onClick={e => showForUpdate(item.orderMasterId)}>{item.gTotal} </TableCell>
                        <TableCell><DeleteOutlineTwoToneIcon color="secondary"  onClick={e => deleteOrder(item.orderMasterId)}/></TableCell>
                    </TableRow>
                ))
            }
        </TableBody>
      </Table>
      </>

  )
}
