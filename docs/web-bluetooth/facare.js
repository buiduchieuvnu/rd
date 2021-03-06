var FACare = function () {
	// Properties
	var that = this;
    this.LogContent = '';
    var myCharacteristic;
    this.log = function (msg) {
        var datetime = '';
        var date = new Date();
        datetime = date.toLocaleString('en-GB');
        that.LogContent += datetime + ' | ' + msg + `\r\n`;
        $('#txtLog').val(that.LogContent);
        var psconsole = $('#txtLog');
        if (psconsole.length)
            psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());
    }

    this.clearLog = function(){
        that.LogContent = '';
        that.log('Clear!');
	}

    this.connectSp02 = function(){
        const SERVICE_UUID = '00001523-1212-efde-1523-785feabcd123';
        const commandCharacteristicUUID = '00001524-1212-efde-1523-785feabcd123'
        const DEVICE_NAME = 'TAIDOC TD8255';
        that.log('Tìm kiếm thiết bị...');
        navigator.bluetooth.requestDevice({
            filters: [{
                name: DEVICE_NAME
            }],
            optionalServices: [SERVICE_UUID]
        }).then(device => {
            that.log('Bắt đầu lấy data từ thiết bị SPO2...');
            device.gatt.connect();
            return device.gatt.connect();
        }).then(server => {
            that.log('getPrimaryService...');
            return server.getPrimaryService(SERVICE_UUID);
        }).then(service => {
            that.log("Getting Characteristic...");
            return service.getCharacteristic(commandCharacteristicUUID);
        }).then(characteristic => {
            myCharacteristic = characteristic;
            return myCharacteristic.startNotifications().then(_ => {
              that.log('> Notifications started');
              myCharacteristic.addEventListener('characteristicvaluechanged',
                  handleNotifications);
            });
        })
        .catch(error => { console.error(error); });
    }

    function handleNotifications(event) {
        that.log('notif value ...');
        console.log('notif value ...');
        let value = event.target.value;
        let a = [];
        // Convert raw data bytes to hex values just for the sake of showing something.
        // In the "real" world, you'd use data.getUint8, data.getUint16 or even
        // TextDecoder to process raw data bytes.
        for (let i = 0; i < value.byteLength; i++) {
          a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
        }
        that.log('> ' + a.join(' '));
        console.log(a.join(' '));
      }

    this.readgetSPO2 = function(){
        that.log ("start read")
        myCharacteristic.addEventListener('characteristicvaluechanged',
        handleReadChanged);
    }

    function handleReadChanged(event) {
        that.log("read value...")
        console.log("read value...")
        let a = event;
        console.log(a);
      }
    
    this.writeSPO2 = function(){
        binaryArray = [81, 97, 2, 0, 0, 0, 163, 7];
        unit8 = new Uint8Array(binaryArray);
        console.log(unit8);
        myCharacteristic.writeValue(unit8);
        
    }

    this.getDescriptorSPO2 = function(){
    
        that.log("Getting Descriptors...");
        myCharacteristic.getDescriptors()
        .then(descriptors => {
            console.log(descriptors);
            that.log('> Descriptors: ' +
              descriptors.map(c => c.uuid).join('\n' + ' '.repeat(19)));
        })
        .catch(error => { console.error(error); });
    }

    // Events
    $(document).ready(function () {

		$('.ACTIONS').on('click','#btnConnectTD8255-SPO2',function(){
			that.connectSp02();
		});
        $('.ACTIONS').on('click','#btnReadTD8255-SPO2',function(){
			that.readgetSPO2();
		});
        $('.ACTIONS').on('click','#btnWriteTD8255-SPO2',function(){
			that.writeSPO2();
		});
        $('.ACTIONS').on('click','#btnDescriptorTD8255-SPO2',function(){
			that.getDescriptorSPO2();
		});
	});

}