import {run} from './run'
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import * as fs from 'fs'

const resourceGroup = 'sample-rg'
const clusterName = 'sample-cluster'
const resourceType = 'Microsoft.ContainerService/managedClusters'
const resourceTypeFleet = 'Microsoft.ContainerService/fleets'
const resourceTypeMixedCasingFleet = 'miCrosOft.contAinerServIce/fleeTs'
const subscription = 'subscription-example'
const azPath = 'path'
const runnerTemp = 'temp'
const date = 1644272184664
// GitHub testrunner was timing out so needed to up the timeout limit
const extendedTimeout = 30000

describe('Set context', () => {
   it('throws without resource-group', async () => {
      await expect(run()).rejects.toThrow()
   })

   it(
      'throws without cluster-name',
      async () => {
         jest.spyOn(core, 'getInput').mockImplementation((inputName) => {
            if (inputName == 'resource-group') return resourceGroup
            if (inputName == 'cluster-name') return ''
            return ''
         })
         await expect(run()).rejects.toThrow()
      },
      extendedTimeout
   )

   it(
      'throws if resource-type is not recognized',
      async () => {
         jest
            .spyOn(core, 'getInput')
            .mockImplementation((inputName, options) => {
               if (inputName == 'resource-group') return resourceGroup
               if (inputName == 'cluster-name') return clusterName
               if (inputName == 'resource-type') return 'invalid-resource-type'
               return ''
            })
         await expect(run()).rejects.toThrow()
      },
      extendedTimeout
   )

   it(
      'throws without az tools',
      async () => {
         jest.spyOn(core, 'getInput').mockImplementation((inputName) => {
            if (inputName == 'resource-group') return resourceGroup
            if (inputName == 'cluster-name') return clusterName
         })
         await expect(run()).rejects.toThrow()
      },
      extendedTimeout
   )

   it('gets the kubeconfig and sets the context', async () => {
      jest.spyOn(core, 'getInput').mockImplementation((inputName) => {
         if (inputName == 'resource-group') return resourceGroup
         if (inputName == 'cluster-name') return clusterName
      })
      jest.spyOn(io, 'which').mockImplementation(async () => azPath)
      process.env['RUNNER_TEMP'] = runnerTemp
      jest.spyOn(Date, 'now').mockImplementation(() => date)
      jest.spyOn(exec, 'exec').mockImplementation(async () => 0)
      jest.spyOn(fs, 'chmodSync').mockImplementation()
      jest.spyOn(core, 'exportVariable').mockImplementation()
      jest.spyOn(core, 'debug').mockImplementation()

      await expect(run()).resolves.not.toThrow()
      const kubeconfigPath = `${runnerTemp}/kubeconfig_${date}`
      expect(exec.exec).toHaveBeenCalledWith('az', [
         'aks',
         'get-credentials',
         '--resource-group',
         resourceGroup,
         '--name',
         clusterName,
         '-f',
         kubeconfigPath
      ])
      expect(fs.chmodSync).toHaveBeenCalledWith(kubeconfigPath, '600')
      expect(core.exportVariable).toHaveBeenCalledWith(
         'KUBECONFIG',
         kubeconfigPath
      )
   })

   it('calls az fleet get-credentials when fleet is the resource type', async () => {
      jest.spyOn(core, 'getInput').mockImplementation((inputName, options) => {
         if (inputName == 'resource-group') return resourceGroup
         if (inputName == 'cluster-name') return clusterName
         if (inputName == 'resource-type') return resourceTypeFleet
         return ''
      })
      jest.spyOn(io, 'which').mockImplementation(async () => azPath)
      process.env['RUNNER_TEMP'] = runnerTemp
      jest.spyOn(Date, 'now').mockImplementation(() => date)
      jest.spyOn(exec, 'exec').mockImplementation(async () => 0)
      jest.spyOn(fs, 'chmodSync').mockImplementation()
      jest.spyOn(core, 'exportVariable').mockImplementation()
      jest.spyOn(core, 'debug').mockImplementation()

      await expect(run()).resolves.not.toThrow()
      const kubeconfigPath = `${runnerTemp}/kubeconfig_${date}`
      expect(exec.exec).toHaveBeenCalledWith('az', [
         'fleet',
         'get-credentials',
         '--resource-group',
         resourceGroup,
         '--name',
         clusterName,
         '-f',
         kubeconfigPath
      ])
      expect(fs.chmodSync).toHaveBeenCalledWith(kubeconfigPath, '600')
      expect(core.exportVariable).toHaveBeenCalledWith(
         'KUBECONFIG',
         kubeconfigPath
      )
      expect(core.debug).toHaveBeenCalledWith(
         `Writing kubeconfig to ${kubeconfigPath}`
      )
   })

   it('passes even if resource type has mixed casing', async () => {
      jest.spyOn(core, 'getInput').mockImplementation((inputName, options) => {
         if (inputName == 'resource-group') return resourceGroup
         if (inputName == 'cluster-name') return clusterName
         if (inputName == 'resource-type') return resourceTypeMixedCasingFleet
         return ''
      })
      jest.spyOn(io, 'which').mockImplementation(async () => azPath)
      process.env['RUNNER_TEMP'] = runnerTemp
      jest.spyOn(Date, 'now').mockImplementation(() => date)
      jest.spyOn(exec, 'exec').mockImplementation(async () => 0)
      jest.spyOn(fs, 'chmodSync').mockImplementation()
      jest.spyOn(core, 'exportVariable').mockImplementation()
      jest.spyOn(core, 'debug').mockImplementation()

      await expect(run()).resolves.not.toThrow()
      const kubeconfigPath = `${runnerTemp}/kubeconfig_${date}`
      expect(exec.exec).toHaveBeenCalledWith('az', [
         'fleet',
         'get-credentials',
         '--resource-group',
         resourceGroup,
         '--name',
         clusterName,
         '-f',
         kubeconfigPath
      ])
      expect(fs.chmodSync).toHaveBeenCalledWith(kubeconfigPath, '600')
      expect(core.exportVariable).toHaveBeenCalledWith(
         'KUBECONFIG',
         kubeconfigPath
      )
      expect(core.debug).toHaveBeenCalledWith(
         `Writing kubeconfig to ${kubeconfigPath}`
      )
   })

   it('gets the kubeconfig and sets the context as a non admin user', async () => {
      jest.spyOn(core, 'getInput').mockImplementation((inputName) => {
         if (inputName == 'resource-group') return resourceGroup
         if (inputName == 'resource-type') return resourceType
         if (inputName == 'cluster-name') return clusterName
         if (inputName == 'admin') return 'false'
         if (inputName == 'use-kubelogin') return 'true'
      })
      jest.spyOn(io, 'which').mockImplementation(async () => azPath)
      process.env['RUNNER_TEMP'] = runnerTemp
      jest.spyOn(Date, 'now').mockImplementation(() => date)
      jest.spyOn(exec, 'exec').mockImplementation(async () => 0)
      jest.spyOn(fs, 'chmodSync').mockImplementation()
      jest.spyOn(core, 'exportVariable').mockImplementation()
      jest.spyOn(core, 'debug').mockImplementation()

      const kubeconfigPath = `${runnerTemp}/kubeconfig_${date}`
      await expect(run()).resolves.not.toThrow()
      expect(exec.exec).toHaveBeenNthCalledWith(1, 'az', [
         'aks',
         'get-credentials',
         '--resource-group',
         resourceGroup,
         '--name',
         clusterName,
         '-f',
         kubeconfigPath
      ])
      expect(exec.exec).toHaveBeenNthCalledWith(2, 'kubelogin', [
         'convert-kubeconfig',
         '-l',
         'azurecli'
      ])
      expect(fs.chmodSync).toHaveBeenCalledWith(kubeconfigPath, '600')
      expect(core.exportVariable).toHaveBeenCalledWith(
         'KUBECONFIG',
         kubeconfigPath
      )
   })

   it('gets the kubeconfig and sets the context with subscription', async () => {
      jest.spyOn(core, 'getInput').mockImplementation((inputName) => {
         if (inputName == 'resource-group') return resourceGroup
         if (inputName == 'resource-type') return resourceType
         if (inputName == 'cluster-name') return clusterName
         if (inputName == 'subscription') return subscription
      })
      jest.spyOn(io, 'which').mockImplementation(async () => azPath)
      process.env['RUNNER_TEMP'] = runnerTemp
      jest.spyOn(Date, 'now').mockImplementation(() => date)
      jest.spyOn(exec, 'exec').mockImplementation(async () => 0)
      jest.spyOn(fs, 'chmodSync').mockImplementation()
      jest.spyOn(core, 'exportVariable').mockImplementation()
      jest.spyOn(core, 'debug').mockImplementation()

      await expect(run()).resolves.not.toThrow()
      const kubeconfigPath = `${runnerTemp}/kubeconfig_${date}`
      expect(exec.exec).toHaveBeenCalledWith('az', [
         'aks',
         'get-credentials',
         '--resource-group',
         resourceGroup,
         '--name',
         clusterName,
         '-f',
         kubeconfigPath,
         '--subscription',
         subscription
      ])
      expect(fs.chmodSync).toHaveBeenCalledWith(kubeconfigPath, '600')
      expect(core.exportVariable).toHaveBeenCalledWith(
         'KUBECONFIG',
         kubeconfigPath
      )
   })

   it('gets the kubeconfig and sets the context with admin', async () => {
      jest.spyOn(core, 'getInput').mockImplementation((inputName) => {
         if (inputName == 'resource-group') return resourceGroup
         if (inputName == 'resource-type') return resourceType
         if (inputName == 'cluster-name') return clusterName
         if (inputName == 'admin') return 'true'
      })
      jest.spyOn(io, 'which').mockImplementation(async () => azPath)
      process.env['RUNNER_TEMP'] = runnerTemp
      jest.spyOn(Date, 'now').mockImplementation(() => date)
      jest.spyOn(exec, 'exec').mockImplementation(async () => 0)
      jest.spyOn(fs, 'chmodSync').mockImplementation()
      jest.spyOn(core, 'exportVariable').mockImplementation()
      jest.spyOn(core, 'debug').mockImplementation()

      await expect(run()).resolves.not.toThrow()
      const kubeconfigPath = `${runnerTemp}/kubeconfig_${date}`
      expect(exec.exec).toHaveBeenCalledWith('az', [
         'aks',
         'get-credentials',
         '--resource-group',
         resourceGroup,
         '--name',
         clusterName,
         '-f',
         kubeconfigPath,
         '--admin'
      ])
      expect(fs.chmodSync).toHaveBeenCalledWith(kubeconfigPath, '600')
      expect(core.exportVariable).toHaveBeenCalledWith(
         'KUBECONFIG',
         kubeconfigPath
      )
   })

   it('can use public-fqdn', async () => {
      jest.spyOn(core, 'getInput').mockImplementation((inputName, options) => {
         if (inputName == 'resource-group') return resourceGroup
         if (inputName == 'resource-type') return resourceType
         if (inputName == 'cluster-name') return clusterName
         if (inputName == 'admin') return 'true'
         if (inputName == 'public-fqdn') return 'true'
      })
      jest.spyOn(io, 'which').mockImplementation(async () => azPath)
      process.env['RUNNER_TEMP'] = runnerTemp
      jest.spyOn(Date, 'now').mockImplementation(() => date)
      jest.spyOn(exec, 'exec').mockImplementation(async () => 0)
      jest.spyOn(fs, 'chmodSync').mockImplementation()
      jest.spyOn(core, 'exportVariable').mockImplementation()
      jest.spyOn(core, 'debug').mockImplementation()

      await expect(run()).resolves.not.toThrow()
      const kubeconfigPath = `${runnerTemp}/kubeconfig_${date}`
      expect(exec.exec).toHaveBeenCalledWith('az', [
         'aks',
         'get-credentials',
         '--resource-group',
         resourceGroup,
         '--name',
         clusterName,
         '-f',
         kubeconfigPath,
         '--admin',
         '--public-fqdn'
      ])
      expect(fs.chmodSync).toHaveBeenCalledWith(kubeconfigPath, '600')
      expect(core.exportVariable).toHaveBeenCalledWith(
         'KUBECONFIG',
         kubeconfigPath
      )
   })
})
